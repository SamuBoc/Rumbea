import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth';
import { colors, font, gradients, radius, spacing } from '../../lib/theme';
import type { UserRole } from '../../lib/types';

export default function RegisterScreen() {
  const { signUpClient, signUpOwner } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Falta info', 'Todos los campos son obligatorios');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Contraseñas distintas', 'Vuelve a escribir tu contraseña');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Mínimo 6 caracteres');
      return;
    }
    try {
      setLoading(true);
      const payload = { email: email.trim(), password, fullName: fullName.trim() };
      if (role === 'client') await signUpClient(payload);
      else await signUpOwner(payload);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error al registrarte', e?.message ?? 'Intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.heroDark}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.eyebrow}>CREA TU CUENTA</Text>
        <Text style={styles.title}>Únete a la rumba</Text>
        <Text style={styles.tagline}>
          Descubre los mejores sitios o publica el tuyo
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.formWrap}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>¿Cómo vas a usar Rumbea?</Text>
          <View style={styles.rolesRow}>
            <RoleCard
              icon="🎉"
              label="Cliente"
              description="Descubrir lugares y eventos"
              active={role === 'client'}
              onPress={() => setRole('client')}
            />
            <RoleCard
              icon="🏢"
              label="Dueño"
              description="Registrar mi establecimiento"
              active={role === 'establishment_owner'}
              onPress={() => setRole('establishment_owner')}
            />
          </View>

          <Input
            label={role === 'client' ? 'Nombre completo' : 'Tu nombre o razón social'}
            value={fullName}
            onChangeText={setFullName}
            placeholder={role === 'client' ? 'Samuel Bonilla' : 'Zaperoco SAS'}
          />
          <Input
            label="Correo"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="tucorreo@ejemplo.com"
          />
          <Input
            label="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar contraseña"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <Button title="Crear cuenta" onPress={onSubmit} loading={loading} />

          <Text style={styles.note}>
            {role === 'establishment_owner'
              ? '✨ Podrás publicar eventos, gestionar aforo y aparecer en búsquedas.'
              : '✨ Marca favoritos, ve aforo en tiempo real y deja reseñas.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function RoleCard({
  icon,
  label,
  description,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  description: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleCard, active && styles.roleCardActive]}
    >
      <Text style={styles.roleIcon}>{icon}</Text>
      <Text style={[styles.roleLabel, active && { color: colors.text }]}>
        {label}
      </Text>
      <Text style={styles.roleDesc}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    paddingTop: 70,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  eyebrow: {
    color: colors.primaryLight,
    fontSize: font.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  tagline: { color: colors.textMuted, fontSize: font.md, marginTop: 6 },
  formWrap: { padding: spacing.lg, paddingTop: spacing.lg },
  sectionTitle: {
    color: colors.text,
    fontSize: font.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  roleIcon: { fontSize: 28, marginBottom: 6 },
  roleLabel: {
    color: colors.textMuted,
    fontSize: font.lg,
    fontWeight: '800',
  },
  roleDesc: {
    color: colors.textDim,
    fontSize: font.sm,
    marginTop: 2,
  },
  note: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 18,
  },
});
