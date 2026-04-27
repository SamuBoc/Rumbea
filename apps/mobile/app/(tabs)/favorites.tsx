import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { EstablishmentCard } from '../../components/EstablishmentCard';
import { Screen } from '../../components/Screen';
import { listFavorites, removeFavorite } from '../../lib/data';
import { colors, font, spacing } from '../../lib/theme';
import type { Establishment } from '../../lib/types';

export default function FavoritesScreen() {
  const [items, setItems] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const favs = await listFavorites();
      setItems(favs);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const unfavorite = async (id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
    try {
      await removeFavorite(id);
    } catch {
      load();
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TUS LUGARES</Text>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>
          {items.length === 0
            ? 'Aquí guardarás los lugares que te gusten'
            : `${items.length} ${items.length === 1 ? 'lugar guardado' : 'lugares guardados'}`}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EstablishmentCard
            item={item}
            isFavorite
            onToggleFavorite={() => unfavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text style={styles.emptyTitle}>Aún no hay favoritos</Text>
            <Text style={styles.empty}>
              Marca con ♥ los lugares que te interesen y aparecerán aquí
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  eyebrow: {
    color: colors.primary,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: font.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginTop: 4,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    lineHeight: 20,
  },
});
