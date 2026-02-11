import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Product } from '../engine/types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../utils/constants';
import { Droplet, Sun, Sparkles, Package, Zap, FlaskConical, SprayCan } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const getCategoryIcon = (category: string, color: string, size: number) => {
  const props = { color, size };
  switch (category) {
    case 'toner': return <Droplet {...props} />;
    case 'serum': return <FlaskConical {...props} />;
    case 'cream': return <Zap {...props} />; // Cream usually represented by jar, using Zap for active effect
    case 'cleanser': return <Sparkles {...props} />;
    case 'sunscreen': return <Sun {...props} />;
    case 'mask': return <SprayCan {...props} />; // Sheet mask
    default: return <Package {...props} />;
  }
};

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
      {/* 체크박스 영역 대신 아이콘 사용 */}
      <View style={[styles.iconContainer, selected && styles.iconActive]}>
        {selected ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          getCategoryIcon(product.category, COLORS.accent, 20)
        )}
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
    borderRadius: BORDER_RADIUS.lg, // 더 둥글게
    padding: SPACING.md,
    marginBottom: SPACING.md, // 간격 넓힘
    borderWidth: 1,
    borderColor: COLORS.border,
    // 그림자 및 glow 효과
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(124,106,255,0.08)', // 약간 더 진하게
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12, // Glow 효과
    elevation: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124,106,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(124,106,255,0.2)',
  },
  iconActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700', // 더 굵게
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  brand: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    marginBottom: 6, // 간격 조정
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: 'rgba(124,106,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,106,255,0.15)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
  },
  ingredientCount: {
    fontSize: 11,
    color: COLORS.textSub,
  },
});
