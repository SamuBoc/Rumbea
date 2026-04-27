import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, font, radius, spacing } from '../lib/theme';

export function Input({
  label,
  error,
  style,
  ...rest
}: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textDim}
        style={[styles.input, !!error && { borderColor: colors.danger }, style]}
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: font.sm,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    fontSize: font.md,
  },
  error: {
    color: colors.danger,
    fontSize: font.sm,
    marginTop: 4,
  },
});
