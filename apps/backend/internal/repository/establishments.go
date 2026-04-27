package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/rumbea/backend/internal/models"
)

var ErrNotFound = errors.New("not found")

type EstablishmentRepo struct {
	Pool *pgxpool.Pool
}

func NewEstablishmentRepo(pool *pgxpool.Pool) *EstablishmentRepo {
	return &EstablishmentRepo{Pool: pool}
}

const establishmentSelectBase = `
select e.id, e.owner_id, e.name, e.address, e.category, e.theme, e.description,
       e.max_capacity, e.current_occupancy, e.cover_price, e.photo_url,
       e.is_premium, e.is_active, e.latitude, e.longitude,
       coalesce(array_agg(g.name) filter (where g.name is not null), '{}') as genres,
       e.created_at, e.updated_at
  from establishments e
  left join establishment_genres eg on eg.establishment_id = e.id
  left join musical_genres g on g.id = eg.genre_id
`

func scanEstablishment(row pgx.Row) (*models.Establishment, error) {
	var e models.Establishment
	if err := row.Scan(
		&e.ID, &e.OwnerID, &e.Name, &e.Address, &e.Category, &e.Theme, &e.Description,
		&e.MaxCapacity, &e.CurrentOccupancy, &e.CoverPrice, &e.PhotoURL,
		&e.IsPremium, &e.IsActive, &e.Latitude, &e.Longitude,
		&e.Genres,
		&e.CreatedAt, &e.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *EstablishmentRepo) GetByID(ctx context.Context, id string) (*models.Establishment, error) {
	q := establishmentSelectBase + ` where e.id = $1 group by e.id`
	row := r.Pool.QueryRow(ctx, q, id)
	e, err := scanEstablishment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return e, nil
}

func (r *EstablishmentRepo) Search(ctx context.Context, f models.SearchFilters) ([]models.Establishment, error) {
	var conds []string
	var args []interface{}
	conds = append(conds, "e.is_active = true")

	add := func(cond string, val interface{}) {
		args = append(args, val)
		conds = append(conds, fmt.Sprintf(cond, len(args)))
	}

	if f.Query != "" {
		add("(e.name ilike '%%' || $%d || '%%' or e.address ilike '%%' || $%d || '%%')", f.Query)
	}
	if f.Category != "" {
		add("e.category = $%d", f.Category)
	}
	if f.Theme != "" {
		add("e.theme ilike '%%' || $%d || '%%'", f.Theme)
	}
	if f.MaxCover != nil {
		add("e.cover_price <= $%d", *f.MaxCover)
	}
	if f.HasCapacity != nil && *f.HasCapacity {
		conds = append(conds, "e.current_occupancy < e.max_capacity")
	}

	where := strings.Join(conds, " and ")

	having := ""
	if len(f.GenreIDs) > 0 {
		args = append(args, f.GenreIDs)
		having = fmt.Sprintf(
			" having bool_or(eg.genre_id = any($%d))",
			len(args),
		)
	}

	order := "e.name asc"
	switch f.SortBy {
	case "recent":
		order = "e.created_at desc"
	case "occupancy":
		order = "(e.current_occupancy::float / nullif(e.max_capacity,0)) asc"
	}

	limit := f.Limit
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	q := establishmentSelectBase +
		" where " + where +
		" group by e.id" +
		having +
		" order by " + order +
		fmt.Sprintf(" limit %d offset %d", limit, f.Offset)

	rows, err := r.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []models.Establishment{}
	for rows.Next() {
		e, err := scanEstablishment(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *e)
	}
	return out, rows.Err()
}

func (r *EstablishmentRepo) Create(ctx context.Context, ownerID string, in models.CreateEstablishmentInput) (*models.Establishment, error) {
	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var id string
	err = tx.QueryRow(ctx, `
		insert into establishments
			(owner_id, name, address, category, theme, description,
			 max_capacity, cover_price, photo_url, latitude, longitude)
		values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		returning id
	`, ownerID, in.Name, in.Address, in.Category, in.Theme, in.Description,
		in.MaxCapacity, in.CoverPrice, in.PhotoURL, in.Latitude, in.Longitude).Scan(&id)
	if err != nil {
		return nil, err
	}

	for _, gid := range in.GenreIDs {
		if _, err := tx.Exec(ctx,
			`insert into establishment_genres (establishment_id, genre_id) values ($1,$2) on conflict do nothing`,
			id, gid); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *EstablishmentRepo) Update(ctx context.Context, id, ownerID string, in models.UpdateEstablishmentInput) (*models.Establishment, error) {
	var sets []string
	var args []interface{}
	add := func(field string, val interface{}) {
		args = append(args, val)
		sets = append(sets, fmt.Sprintf("%s = $%d", field, len(args)))
	}

	if in.Name != nil {
		add("name", *in.Name)
	}
	if in.Address != nil {
		add("address", *in.Address)
	}
	if in.Category != nil {
		add("category", *in.Category)
	}
	if in.Theme != nil {
		add("theme", *in.Theme)
	}
	if in.Description != nil {
		add("description", *in.Description)
	}
	if in.MaxCapacity != nil {
		add("max_capacity", *in.MaxCapacity)
	}
	if in.CoverPrice != nil {
		add("cover_price", *in.CoverPrice)
	}
	if in.PhotoURL != nil {
		add("photo_url", *in.PhotoURL)
	}
	if in.Latitude != nil {
		add("latitude", *in.Latitude)
	}
	if in.Longitude != nil {
		add("longitude", *in.Longitude)
	}

	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	if len(sets) > 0 {
		args = append(args, id, ownerID)
		q := fmt.Sprintf(
			"update establishments set %s where id = $%d and owner_id = $%d",
			strings.Join(sets, ", "), len(args)-1, len(args),
		)
		tag, err := tx.Exec(ctx, q, args...)
		if err != nil {
			return nil, err
		}
		if tag.RowsAffected() == 0 {
			return nil, ErrNotFound
		}
	}

	if in.GenreIDs != nil {
		if _, err := tx.Exec(ctx, `delete from establishment_genres where establishment_id = $1`, id); err != nil {
			return nil, err
		}
		for _, gid := range in.GenreIDs {
			if _, err := tx.Exec(ctx,
				`insert into establishment_genres (establishment_id, genre_id) values ($1,$2) on conflict do nothing`,
				id, gid); err != nil {
				return nil, err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *EstablishmentRepo) UpdateOccupancy(ctx context.Context, id, ownerID string, occ int) error {
	tag, err := r.Pool.Exec(ctx, `
		update establishments
		   set current_occupancy = $1
		 where id = $2 and owner_id = $3
		   and $1 <= max_capacity
		   and $1 >= 0
	`, occ, id, ownerID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *EstablishmentRepo) Delete(ctx context.Context, id, ownerID string) error {
	tag, err := r.Pool.Exec(ctx, `delete from establishments where id = $1 and owner_id = $2`, id, ownerID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *EstablishmentRepo) ListGenres(ctx context.Context) ([]models.Genre, error) {
	rows, err := r.Pool.Query(ctx, `select id, name from musical_genres order by name asc`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []models.Genre{}
	for rows.Next() {
		var g models.Genre
		if err := rows.Scan(&g.ID, &g.Name); err != nil {
			return nil, err
		}
		out = append(out, g)
	}
	return out, rows.Err()
}
