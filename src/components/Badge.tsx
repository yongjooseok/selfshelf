import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Severity } from '../engine/types';
import { SEVERITY_COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../utils/constants';

interface BadgeProps {
  label: string;
  severity: Severity;
  count?: number;
}

export function Badge({ label, severity, count }: BadgeProps) {
  const color = SEVERITY_COLORS[severity];

  return (
    <View style={[styles.container, { backgroundColor: color.bg }]}>
      <Text style={[styles.label, { color: color.main }]}>
        {label}
        {count !== undefined ? ` ${count}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
