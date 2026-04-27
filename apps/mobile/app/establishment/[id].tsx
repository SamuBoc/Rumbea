import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../lib/auth';
import {
  addFavorite,
  getEstablishment,
  isFavorite as isFavoriteFn,
  listLinks,
  removeFavorite,
} from '../../lib/data';
import { colors, font, radius, shadow, spacing } from '../../lib/theme';
import type { Establishment, EstablishmentLink } from '../../lib/types';

const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200';

export default function EstablishmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [links, setLinks] = useState<EstablishmentLink[]>([]);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [e, ls, f] = await Promise.all([
      getEstablishment(id),
      listLinks(id),
      isFavoriteFn(id),
    ]);
    setEstablishment(e);
    setLinks(ls);
    setFav(f);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleFav = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    const newFav = !fav;
    setFav(newFav);
    try {
      if (newFav) await addFavorite(id!);
      else await removeFavorite(id!);
    } catch {
      setFav(!newFav);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!establishment) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>
          No encontramos este establecimiento.
        </Text>
      </Screen>
    );
  }

  const ratio =
    establishment.max_capacity > 0
      ? establishment.current_occupancy / establishment.max_capacity
      : 0;
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

  const isOwner = user?.id === establishment.owner_id;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={{ uri: establishment.photo_url ?? DEFAULT_PHOTO }}
          style={styles.hero}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', colors.bg]}
            style={StyleSheet.absoluteFill}
            locations={[0.5, 1]}
          />
          <Pressable
            style={styles.favBtn}
            onPress={toggleFav}
            hitSlop={12}
          >
            <Text style={styles.favIcon}>{fav ? '♥' : '♡'}</Text>
          </Pressable>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.chipsRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {labelCategory(establishment.category)}
              </Text>
            </View>
            {establishment.is_premium && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.badgeText, { color: '#0A0A1F' }]}>
                  ★ Premium
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{establishment.name}</Text>
          <Text style={styles.address}>📍 {establishment.address}</Text>
          {establishment.theme && (
            <Text style={styles.theme}>🎵 {establishment.theme}</Text>
          )}

          <View style={[styles.occupancyCard, shadow.card]}>
            <View style={styles.occupancyHeader}>
              <Text style={styles.sectionLabel}>AFORO EN VIVO</Text>
              <View style={[styles.statusPill, { borderColor: occupancyColor }]}>
                <View style={[styles.dot, { backgroundColor: occupancyColor }]} />
                <Text style={[styles.statusText, { color: occupancyColor }]}>
                  {occupancyLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.occupancyText}>
              <Text style={[styles.occupancyBig, { color: occupancyColor }]}>
                {establishment.current_occupancy}
              </Text>
              <Text style={styles.occupancyMid}>
                {' '}
                / {establishment.max_capacity}
              </Text>
              <Text style={styles.occupancySmall}> personas</Text>
            </Text>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, ratio * 100)}%`,
                    backgroundColor: occupancyColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Cover</Text>
              <Text style={styles.infoValue}>
                {establishment.cover_price > 0
                  ? `$${establishment.cover_price.toLocaleString('es-CO')}`
                  : 'Gratis'}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Capacidad</Text>
              <Text style={styles.infoValue}>{establishment.max_capacity}</Text>
            </View>
          </View>

          {establishment.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acerca del lugar</Text>
              <Text style={styles.description}>{establishment.description}</Text>
            </View>
          )}

          {establishment.genres && establishment.genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Música</Text>
              <View style={styles.chipsRow}>
                {establishment.genres.map((g) => (
                  <View key={g} style={styles.genreBadge}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {links.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enlaces</Text>
              {links.map((l) => (
                <Pressable
                  key={l.id}
                  style={styles.link}
                  onPress={() => Linking.openURL(l.url)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkLabel}>{l.label}</Text>
                    <Text style={styles.linkUrl} numberOfLines={1}>
                      {l.url}
                    </Text>
                  </View>
                  <Text style={styles.linkArrow}>↗</Text>
                </Pressable>
              ))}
            </View>
          )}

          {isOwner && (
            <View style={{ marginTop: spacing.xl }}>
              <Button
                title="Gestionar mi establecimiento"
                onPress={() => router.push('/establishment/manage')}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  hero: {
    width: '100%',
    height: 320,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'flex-end',
  },
  favBtn: {
    position: 'absolute',
    top: 60,
    right: spacing.md,
    backgroundColor: 'rgba(10,10,31,0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: { color: colors.primary, fontSize: 24 },
  body: { padding: spacing.lg, marginTop: -spacing.xl },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    color: colors.text,
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  name: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  address: {
    color: colors.textMuted,
    fontSize: font.md,
    marginTop: 4,
  },
  theme: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginTop: 2,
  },
  occupancyCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.primary,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  statusText: { fontSize: font.xs, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  occupancyText: { marginVertical: spacing.xs },
  occupancyBig: { fontSize: 36, fontWeight: '900' },
  occupancyMid: { color: colors.text, fontSize: 22, fontWeight: '700' },
  occupancySmall: { color: colors.textMuted, fontSize: font.md },
  progressBg: {
    height: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: 5 },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '800',
    marginTop: 4,
  },
  section: { marginTop: spacing.xl },
  sectionTitle: {
    color: colors.primaryLight,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text,
    fontSize: font.md,
    lineHeight: 22,
  },
  genreBadge: {
    backgroundColor: 'rgba(255,46,126,0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  genreText: {
    color: colors.primaryLight,
    fontSize: font.sm,
    fontWeight: '700',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  linkLabel: { color: colors.primaryLight, fontWeight: '800', fontSize: font.md },
  linkUrl: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginTop: 2,
  },
  linkArrow: {
    color: colors.primary,
    fontSize: 24,
    marginLeft: spacing.md,
  },
});
