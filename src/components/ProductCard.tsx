import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Product } from '../engine/types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../utils/constants';

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ProductCard({
  product,
  selected = false,
  onPress,
  onLongPress,
}: ProductCardProps) {
  const { t } = useTranslation();

  // i18n 키 기반 카테고리 라벨 (register.category.*)
  const categoryLabel = t(`register.category.${product.category}`);

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* 체크박스 */}
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* 제품 정보 */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        {product.brand.length > 0 && (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          {product.ingredients.length > 0 && (
            <Text style={styles.ingredientCount}>
              {t('common.ingredients', {
                defaultValue: `${product.ingredients.length}개 성분`,
              })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  selected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(124,106,255,0.06)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSub,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: -1,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  brand: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs + 2,
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: 'rgba(124,106,255,0.12)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.accent,
  },
  ingredientCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
  },
});
