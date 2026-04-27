import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, gradients, radius, shadow, spacing } from '../lib/theme';

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const isPrimary = variant === 'primary';
  const inner = loading ? (
    <ActivityIndicator color={colors.text} />
  ) : (
    <Text style={styles.text}>{title}</Text>
  );

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.wrap, { opacity: disabled || loading ? 0.6 : 1 }]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, shadow.glow]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  const bg = variant === 'danger' ? colors.danger : colors.surfaceAlt;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled || loading ? 0.6 : 1 },
        variant === 'secondary' && {
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
