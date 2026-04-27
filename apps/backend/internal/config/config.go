package config

import (
	"os"
	"strings"
)

type Config struct {
	Port               string
	DatabaseURL        string
	SupabaseJWTSecret  string
	SupabaseURL        string
	Env                string
	CORSAllowedOrigins []string
}

func Load() Config {
	return Config{
		Port:               getenv("PORT", "8080"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		SupabaseJWTSecret:  os.Getenv("SUPABASE_JWT_SECRET"),
		SupabaseURL:        os.Getenv("SUPABASE_URL"),
		Env:                getenv("ENV", "development"),
		CORSAllowedOrigins: splitCSV(getenv("CORS_ALLOWED_ORIGINS", "*")),
	}
}

func (c Config) IsProduction() bool {
	return c.Env == "production"
}

func (c Config) HasDatabase() bool {
	return strings.TrimSpace(c.DatabaseURL) != ""
}

func (c Config) HasAuth() bool {
	return strings.TrimSpace(c.SupabaseJWTSecret) != ""
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
