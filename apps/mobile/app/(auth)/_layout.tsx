import { Stack } from 'expo-router';
import { colors } from '../../lib/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Rumbea' }} />
      <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
    </Stack>
  );
}
