import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, spacing } from '../lib/theme';

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    color: colors.textMuted,
    fontSize: font.sm,
    fontWeight: '600',
  },
  textActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
