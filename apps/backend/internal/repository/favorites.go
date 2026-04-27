package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/rumbea/backend/internal/models"
)

type FavoriteRepo struct {
	Pool *pgxpool.Pool
}

func NewFavoriteRepo(pool *pgxpool.Pool) *FavoriteRepo {
	return &FavoriteRepo{Pool: pool}
}

func (r *FavoriteRepo) ListByUser(ctx context.Context, userID string) ([]models.Establishment, error) {
	q := establishmentSelectBase + `
		inner join favorites f on f.establishment_id = e.id
		where f.user_id = $1
		group by e.id, f.created_at
		order by f.created_at desc
	`
	rows, err := r.Pool.Query(ctx, q, userID)
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

func (r *FavoriteRepo) Add(ctx context.Context, userID, establishmentID string) error {
	_, err := r.Pool.Exec(ctx, `
		insert into favorites (user_id, establishment_id)
		values ($1, $2)
		on conflict (user_id, establishment_id) do nothing
	`, userID, establishmentID)
	return err
}

func (r *FavoriteRepo) Remove(ctx context.Context, userID, establishmentID string) error {
	_, err := r.Pool.Exec(ctx, `
		delete from favorites where user_id = $1 and establishment_id = $2
	`, userID, establishmentID)
	return err
}

func (r *FavoriteRepo) Exists(ctx context.Context, userID, establishmentID string) (bool, error) {
	var exists bool
	err := r.Pool.QueryRow(ctx, `
		select exists(select 1 from favorites where user_id = $1 and establishment_id = $2)
	`, userID, establishmentID).Scan(&exists)
	return exists, err
}
