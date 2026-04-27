package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/rumbea/backend/internal/models"
)

type LinkRepo struct {
	Pool *pgxpool.Pool
}

func NewLinkRepo(pool *pgxpool.Pool) *LinkRepo {
	return &LinkRepo{Pool: pool}
}

func (r *LinkRepo) ListByEstablishment(ctx context.Context, establishmentID string) ([]models.EstablishmentLink, error) {
	rows, err := r.Pool.Query(ctx, `
		select id, establishment_id, label, url, created_at
		  from establishment_links
		 where establishment_id = $1
		 order by created_at asc
	`, establishmentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []models.EstablishmentLink{}
	for rows.Next() {
		var l models.EstablishmentLink
		if err := rows.Scan(&l.ID, &l.EstablishmentID, &l.Label, &l.URL, &l.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, l)
	}
	return out, rows.Err()
}

func (r *LinkRepo) Create(ctx context.Context, establishmentID, label, url string) (*models.EstablishmentLink, error) {
	var l models.EstablishmentLink
	err := r.Pool.QueryRow(ctx, `
		insert into establishment_links (establishment_id, label, url)
		values ($1, $2, $3)
		returning id, establishment_id, label, url, created_at
	`, establishmentID, label, url).Scan(&l.ID, &l.EstablishmentID, &l.Label, &l.URL, &l.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *LinkRepo) Delete(ctx context.Context, linkID, ownerID string) error {
	tag, err := r.Pool.Exec(ctx, `
		delete from establishment_links l
		 using establishments e
		 where l.id = $1
		   and l.establishment_id = e.id
		   and e.owner_id = $2
	`, linkID, ownerID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *LinkRepo) VerifyOwner(ctx context.Context, establishmentID, ownerID string) (bool, error) {
	var ok bool
	err := r.Pool.QueryRow(ctx,
		`select exists(select 1 from establishments where id = $1 and owner_id = $2)`,
		establishmentID, ownerID,
	).Scan(&ok)
	return ok, err
}
