import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, gradients, radius, shadow, spacing } from '../lib/theme';
import type { Establishment } from '../lib/types';

const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900';

export function EstablishmentCard({
  item,
  onToggleFavorite,
  isFavorite,
}: {
  item: Establishment;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}) {
  const ratio =
    item.max_capacity > 0 ? item.current_occupancy / item.max_capacity : 0;
  const isFull = ratio >= 1;
  const occupancyLabel = isFull
    ? 'Lleno'
    : ratio >= 0.8
      ? 'Casi lleno'
      : ratio >= 0.5
        ? 'Disponible'
        : 'Vacío';
  const occupancyColor = isFull
    ? colors.danger
    : ratio >= 0.8
      ? colors.accent
      : colors.success;

  return (
    <Link href={`/establishment/${item.id}`} asChild>
      <Pressable style={[styles.card, shadow.card]}>
        <ImageBackground
          source={{ uri: item.photo_url ?? DEFAULT_PHOTO }}
          style={styles.photo}
          imageStyle={{ borderRadius: radius.md }}
        >
          <LinearGradient
            colors={gradients.card}
            style={styles.photoOverlay}
          />

          <View style={styles.topRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {labelCategory(item.category)}
              </Text>
            </View>
            {item.is_premium && (
              <View style={styles.premiumPill}>
                <Text style={styles.premiumText}>★ Premium</Text>
              </View>
            )}
          </View>

          {onToggleFavorite && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={styles.fav}
              hitSlop={12}
            >
              <Text style={styles.favIcon}>{isFavorite ? '♥' : '♡'}</Text>
            </Pressable>
          )}

          <View style={styles.bottom}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              📍 {item.address}
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <View style={[styles.dot, { backgroundColor: occupancyColor }]} />
                <Text style={[styles.metricText, { color: occupancyColor }]}>
                  {occupancyLabel}
                </Text>
                <Text style={styles.metricSub}>
                  · {item.current_occupancy}/{item.max_capacity}
                </Text>
              </View>
              {item.cover_price > 0 ? (
                <Text style={styles.cover}>
                  ${item.cover_price.toLocaleString('es-CO')}
                </Text>
              ) : (
                <Text style={styles.coverFree}>Sin cover</Text>
              )}
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    </Link>
  );
}

function labelCategory(c: string) {
  const map: Record<string, string> = {
    discoteca: 'Discoteca',
    bar: 'Bar',
    cocteleria: 'Coctelería',
    lounge: 'Lounge',
    pub: 'Pub',
    otro: 'Otro',
  };
  return map[c] ?? c;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  photo: {
    height: 220,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  categoryPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  categoryText: {
    color: colors.text,
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  premiumPill: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  premiumText: {
    color: '#0A0A1F',
    fontSize: font.xs,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fav: {
    position: 'absolute',
    top: spacing.md + 30,
    right: spacing.md,
    backgroundColor: 'rgba(10,10,31,0.7)',
    borderRadius: radius.full,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  favIcon: { color: colors.primary, fontSize: 22 },
  bottom: { padding: spacing.md },
  name: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '800',
  },
  address: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  metricText: {
    fontSize: font.sm,
    fontWeight: '700',
  },
  metricSub: { color: colors.textMuted, fontSize: font.sm },
  cover: {
    color: colors.accent,
    fontSize: font.md,
    fontWeight: '800',
  },
  coverFree: {
    color: colors.success,
    fontSize: font.sm,
    fontWeight: '700',
  },
});
