package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	userIDKey contextKey = "user_id"
	roleKey   contextKey = "role"
)

// Auth valida el JWT emitido por Supabase Auth (HS256 con JWT_SECRET).
// Si `required` es true, rechaza requests sin token.
// Si es false, deja pasar pero sin user en contexto (útil para endpoints mixtos).
func Auth(jwtSecret string, required bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				if required {
					http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			tokenStr = strings.TrimSpace(tokenStr)
			if tokenStr == "" {
				if required {
					http.Error(w, `{"error":"empty bearer token"}`, http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrTokenSignatureInvalid
				}
				return []byte(jwtSecret), nil
			})
			if err != nil || !token.Valid {
				if required {
					http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				if required {
					http.Error(w, `{"error":"invalid claims"}`, http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			userID, _ := claims["sub"].(string)
			role, _ := claims["role"].(string)

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			ctx = context.WithValue(ctx, roleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserID(ctx context.Context) string {
	v, _ := ctx.Value(userIDKey).(string)
	return v
}

func Role(ctx context.Context) string {
	v, _ := ctx.Value(roleKey).(string)
	return v
}
