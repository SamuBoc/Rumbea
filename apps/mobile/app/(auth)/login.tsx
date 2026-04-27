import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { isMockMode, useAuth } from '../../lib/auth';
import { colors, font, gradients, radius, spacing } from '../../lib/theme';

export default function LoginScreen() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Falta info', 'Ingresa correo y contraseña');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error al iniciar sesión', e?.message ?? 'Intenta de nuevo');
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
        <Text style={styles.eyebrow}>BIENVENIDO A</Text>
        <Text style={styles.logo}>Rumbea</Text>
        <Text style={styles.tagline}>Encuentra la mejor noche de Cali 🌙</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.formWrap}
          keyboardShouldPersistTaps="handled"
        >
          {isMockMode() && (
            <View style={styles.mockBanner}>
              <Text style={styles.mockText}>
                💡 Modo demo. Usa cualquier correo. Si incluye "owner" entras como dueño.
              </Text>
            </View>
          )}

          <Input
            label="Correo"
            placeholder="tucorreo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Iniciar sesión" onPress={onSubmit} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <Link href="/(auth)/register" style={styles.link}>
              Regístrate gratis
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    paddingTop: 80,
    paddingBottom: spacing.xxl,
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
  logo: {
    color: colors.text,
    fontSize: font.hero,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: font.lg,
    marginTop: 8,
  },
  formWrap: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  mockBanner: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  mockText: { color: colors.textMuted, fontSize: font.sm, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: 6,
  },
  footerText: { color: colors.textMuted },
  link: { color: colors.primaryLight, fontWeight: '800' },
});
