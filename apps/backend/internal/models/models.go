package models

import "time"

type Profile struct {
	ID        string    `json:"id"`
	FullName  string    `json:"full_name"`
	Role      string    `json:"role"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Establishment struct {
	ID               string    `json:"id"`
	OwnerID          string    `json:"owner_id"`
	Name             string    `json:"name"`
	Address          string    `json:"address"`
	Category         string    `json:"category"`
	Theme            *string   `json:"theme,omitempty"`
	Description      *string   `json:"description,omitempty"`
	MaxCapacity      int       `json:"max_capacity"`
	CurrentOccupancy int       `json:"current_occupancy"`
	CoverPrice       int       `json:"cover_price"`
	PhotoURL         *string   `json:"photo_url,omitempty"`
	IsPremium        bool      `json:"is_premium"`
	IsActive         bool      `json:"is_active"`
	Latitude         *float64  `json:"latitude,omitempty"`
	Longitude        *float64  `json:"longitude,omitempty"`
	Genres           []string  `json:"genres,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type CreateEstablishmentInput struct {
	Name        string   `json:"name"`
	Address     string   `json:"address"`
	Category    string   `json:"category"`
	Theme       *string  `json:"theme"`
	Description *string  `json:"description"`
	MaxCapacity int      `json:"max_capacity"`
	CoverPrice  int      `json:"cover_price"`
	PhotoURL    *string  `json:"photo_url"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	GenreIDs    []int    `json:"genre_ids"`
}

type UpdateEstablishmentInput struct {
	Name        *string  `json:"name"`
	Address     *string  `json:"address"`
	Category    *string  `json:"category"`
	Theme       *string  `json:"theme"`
	Description *string  `json:"description"`
	MaxCapacity *int     `json:"max_capacity"`
	CoverPrice  *int     `json:"cover_price"`
	PhotoURL    *string  `json:"photo_url"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	GenreIDs    []int    `json:"genre_ids"`
}

type OccupancyInput struct {
	CurrentOccupancy int `json:"current_occupancy"`
}

type EstablishmentLink struct {
	ID              string    `json:"id"`
	EstablishmentID string    `json:"establishment_id"`
	Label           string    `json:"label"`
	URL             string    `json:"url"`
	CreatedAt       time.Time `json:"created_at"`
}

type CreateLinkInput struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type Favorite struct {
	UserID          string    `json:"user_id"`
	EstablishmentID string    `json:"establishment_id"`
	CreatedAt       time.Time `json:"created_at"`
}

type Genre struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type SearchFilters struct {
	Query       string
	Category    string
	GenreIDs    []int
	MaxCover    *int
	HasCapacity *bool
	Theme       string
	SortBy      string
	Limit       int
	Offset      int
}
