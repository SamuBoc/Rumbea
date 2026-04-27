import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Chip } from '../../components/Chip';
import { EstablishmentCard } from '../../components/EstablishmentCard';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../lib/auth';
import {
  addFavorite,
  listEstablishments,
  listFavorites,
  listGenres,
  removeFavorite,
} from '../../lib/data';
import { colors, font, radius, spacing } from '../../lib/theme';
import type {
  Establishment,
  EstablishmentCategory,
  Genre,
  SearchFilters,
} from '../../lib/types';

const CATEGORIES: { key: EstablishmentCategory; label: string }[] = [
  { key: 'discoteca', label: 'Discoteca' },
  { key: 'bar', label: 'Bar' },
  { key: 'cocteleria', label: 'Coctelería' },
  { key: 'lounge', label: 'Lounge' },
  { key: 'pub', label: 'Pub' },
  { key: 'otro', label: 'Otro' },
];

export default function ExploreScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Establishment[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EstablishmentCategory | undefined>();
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const [maxCover, setMaxCover] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'occupancy' | undefined>();

  const filters: SearchFilters = useMemo(
    () => ({
      q: query || undefined,
      category,
      genreIds: genreIds.length ? genreIds : undefined,
      maxCover: maxCover ? Number(maxCover) : undefined,
      hasCapacity: onlyAvailable || undefined,
      sortBy,
    }),
    [query, category, genreIds, maxCover, onlyAvailable, sortBy],
  );

  useEffect(() => {
    listGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([listEstablishments(filters), listFavorites()])
      .then(([list, favs]) => {
        if (!active) return;
        setItems(list);
        setFavorites(new Set(favs.map((f) => f.id)));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters]);

  const toggleFavorite = async (id: string) => {
    const isFav = favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (isFav) await removeFavorite(id);
      else await addFavorite(id);
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const toggleGenre = (id: number) => {
    setGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setCategory(undefined);
    setGenreIds([]);
    setMaxCover('');
    setOnlyAvailable(false);
    setSortBy(undefined);
  };

  const activeFilterCount =
    (category ? 1 : 0) +
    (genreIds.length ? 1 : 0) +
    (maxCover ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (sortBy ? 1 : 0);

  const greeting = user?.full_name
    ? `Hola, ${user.full_name.split(' ')[0]} 👋`
    : 'Hola 👋';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.title}>Explora Cali 🌙</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Buscar por nombre o zona"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
        <Pressable
          style={[
            styles.filterBtn,
            activeFilterCount > 0 && styles.filterBtnActive,
          ]}
          onPress={() => setFiltersOpen(true)}
        >
          <Text
            style={[
              styles.filterBtnText,
              activeFilterCount > 0 && { color: colors.text },
            ]}
          >
            Filtros{activeFilterCount ? ` · ${activeFilterCount}` : ''}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: spacing.xl }}
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <EstablishmentCard
              item={item}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyText}>
                Prueba con otros filtros o término de búsqueda
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Filtros</Text>

            <Text style={styles.modalSection}>Categoría</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  active={category === c.key}
                  onPress={() =>
                    setCategory((prev) => (prev === c.key ? undefined : c.key))
                  }
                />
              ))}
            </View>

            <Text style={styles.modalSection}>Género musical</Text>
            <View style={styles.chipsRow}>
              {genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  active={genreIds.includes(g.id)}
                  onPress={() => toggleGenre(g.id)}
                />
              ))}
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="Cover máximo (COP)"
                keyboardType="numeric"
                value={maxCover}
                onChangeText={setMaxCover}
                placeholder="Ej: 30000"
              />
            </View>

            <Text style={styles.modalSection}>Disponibilidad</Text>
            <View style={styles.chipsRow}>
              <Chip
                label="Solo con cupo disponible"
                active={onlyAvailable}
                onPress={() => setOnlyAvailable((v) => !v)}
              />
            </View>

            <Text style={styles.modalSection}>Orden</Text>
            <View style={styles.chipsRow}>
              <Chip
                label="Más recientes"
                active={sortBy === 'recent'}
                onPress={() =>
                  setSortBy((prev) => (prev === 'recent' ? undefined : 'recent'))
                }
              />
              <Chip
                label="Menos llenos"
                active={sortBy === 'occupancy'}
                onPress={() =>
                  setSortBy((prev) =>
                    prev === 'occupancy' ? undefined : 'occupancy',
                  )
                }
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable onPress={clearFilters} style={styles.clearBtn}>
                <Text style={styles.clearText}>Limpiar</Text>
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(false)}
                style={styles.applyBtn}
              >
                <Text style={styles.applyText}>Aplicar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  greeting: {
    color: colors.textMuted,
    fontSize: font.md,
    marginBottom: 2,
  },
  title: {
    color: colors.text,
    fontSize: font.xxl,
    fontWeight: '900',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: { color: colors.text, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: spacing.xxl },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { color: colors.text, fontSize: font.lg, fontWeight: '800' },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  modalSection: {
    color: colors.primaryLight,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearText: { color: colors.text, fontWeight: '700' },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyText: { color: colors.text, fontWeight: '800' },
});
