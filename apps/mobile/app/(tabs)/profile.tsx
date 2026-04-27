import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { isMockMode, useAuth } from '../../lib/auth';
import { colors, font, gradients, radius, shadow, spacing } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No has iniciado sesión</Text>
          <Text style={styles.emptySub}>
            Crea tu cuenta para guardar favoritos y descubrir más
          </Text>
          <Button
            title="Iniciar sesión"
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>
      </Screen>
    );
  }

  const isOwner = user.role === 'establishment_owner';
  const initial = (user.full_name?.[0] || '?').toUpperCase();

  return (
    <Screen padded={false}>
      <LinearGradient
        colors={gradients.heroDark}
        style={styles.hero}
      >
        <View style={[styles.avatarWrap, shadow.glow]}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.name}>{user.full_name || 'Sin nombre'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {isOwner ? '🏢 Dueño de establecimiento' : '🎉 Cliente'}
          </Text>
        </View>
        {isMockMode() && (
          <Text style={styles.mockTag}>Modo demo (sin backend)</Text>
        )}
      </LinearGradient>

      <View style={styles.body}>
        {isOwner && (
          <Link href="/establishment/manage" asChild>
            <Pressable style={[styles.actionCard, shadow.card]}>
              <Text style={styles.actionEmoji}>🏢</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Mi establecimiento</Text>
                <Text style={styles.actionSubtitle}>
                  Editar perfil, enlaces, aforo y eventos
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </Pressable>
          </Link>
        )}

        <Pressable
          style={[styles.actionCard, shadow.card]}
          onPress={() => Alert.alert('Próximamente', 'Editar perfil estará disponible muy pronto')}
        >
          <Text style={styles.actionEmoji}>⚙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Configuración</Text>
            <Text style={styles.actionSubtitle}>Notificaciones, privacidad</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>

        <View style={{ marginTop: spacing.lg }}>
          <Button
            title="Cerrar sesión"
            variant="secondary"
            onPress={() => {
              Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: onLogout },
              ]);
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '800',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: font.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatarWrap: {
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '900',
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,46,126,0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  roleText: { color: colors.primaryLight, fontWeight: '700', fontSize: font.sm },
  mockTag: {
    color: colors.accent,
    fontSize: font.sm,
    marginTop: 8,
  },
  body: { padding: spacing.lg, gap: spacing.md },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  actionEmoji: { fontSize: 28 },
  actionTitle: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginTop: 2,
  },
  actionArrow: {
    color: colors.textDim,
    fontSize: 28,
    fontWeight: '300',
  },
});
