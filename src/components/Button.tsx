import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { COLORS, BORDER_RADIUS, FONT_SIZE, SPACING } from '../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const containerStyles = [
    styles.base,
    styles[`container_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.white : COLORS.accent}
          size="small"
        />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  container_primary: {
    backgroundColor: COLORS.accent,
  },
  container_secondary: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  container_ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  size_md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  size_lg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg - 4,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '600',
  },
  label_primary: {
    color: COLORS.white,
  },
  label_secondary: {
    color: COLORS.text,
  },
  label_ghost: {
    color: COLORS.accent,
  },
  labelSize_sm: {
    fontSize: FONT_SIZE.sm,
  },
  labelSize_md: {
    fontSize: FONT_SIZE.md,
  },
  labelSize_lg: {
    fontSize: FONT_SIZE.lg,
  },
});
