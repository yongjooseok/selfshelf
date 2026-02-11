import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductStore } from '../../src/store/productStore';
import { ProductCard } from '../../src/components/ProductCard';
import { Button } from '../../src/components/Button';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../../src/utils/constants';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const products = useProductStore((s) => s.products);
  const removeProduct = useProductStore((s) => s.remove);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 제품이 삭제되면 selectedIds에서 제거
  useEffect(() => {
    const productIdSet = new Set(products.map((p) => p.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (productIdSet.has(id)) next.add(id);
      }
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [products]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t('home.product.delete'), t('home.product.deleteConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            removeProduct(id);
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          },
        },
      ]);
    },
    [t, removeProduct],
  );

  const handleAnalyze = useCallback(() => {
    const ids = Array.from(selectedIds);
    // 성분이 없는 제품이 포함되어 있으면 경고
    const emptyProduct = ids
      .map((id) => products.find((p) => p.id === id))
      .find((p) => p && p.ingredients.length === 0);
    if (emptyProduct) {
      Alert.alert(t('error.analysis.noIngredients'));
      return;
    }
    router.push({ pathname: '/results', params: { productIds: ids.join(',') } });
  }, [selectedIds, router, products, t]);

  const hasProducts = products.length > 0;
  const canAnalyze = selectedIds.size >= 2;

  // ────────────────────────────────────────────
  // 빈 상태
  // ────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      {/* 아이콘 placeholder */}
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>🧴</Text>
      </View>

      <Text style={styles.emptyTitle}>{t('home.empty.title')}</Text>
      <Text style={styles.emptyBody}>{t('home.empty.body')}</Text>

      <Button
        title={t('home.empty.cta')}
        onPress={() => router.push('/register')}
        size="lg"
        style={styles.emptyCta}
      />
    </View>
  );

  // ────────────────────────────────────────────
  // 헤더 (제품 있을 때만 subtitle + addProduct 표시)
  // ────────────────────────────────────────────
  const renderHeader = () => (
    <>
      {/* 선택 안내 배너 */}
      {hasProducts && !canAnalyze && (
        <View style={styles.promptBanner}>
          <Text style={styles.promptText}>{t('home.selectPrompt')}</Text>
        </View>
      )}

      {/* 선택 완료 배너 */}
      {canAnalyze && (
        <View style={[styles.promptBanner, styles.promptBannerActive]}>
          <Text style={styles.promptTextActive}>
            {t('home.selected', { count: selectedIds.size })}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── 상단 헤더 ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SelfShelf Test Success</Text>
          {hasProducts && (
            <Text style={styles.subtitle}>
              {t('home.subtitle', { count: products.length })}
            </Text>
          )}
        </View>

        {hasProducts && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnIcon}>+</Text>
            <Text style={styles.addBtnLabel}>{t('home.addProduct')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── 제품 목록 ── */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            selected={selectedIds.has(item.id)}
            onPress={() => toggleSelect(item.id)}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        ListHeaderComponent={hasProducts ? renderHeader : undefined}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          !hasProducts && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* ── 하단 분석 버튼 (2개 이상 선택 시) ── */}
      {canAnalyze && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 84 },
          ]}
        >
          <Button
            title={`${t('home.analyze')}  (${selectedIds.size})`}
            onPress={handleAnalyze}
            size="lg"
            style={styles.analyzeBtn}
          />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── 헤더 ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    gap: 4,
  },
  addBtnIcon: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.accent,
  },
  addBtnLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // ── 선택 안내 배너 ──
  promptBanner: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptBannerActive: {
    backgroundColor: 'rgba(124,106,255,0.08)',
    borderColor: COLORS.accent,
  },
  promptText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    textAlign: 'center',
  },
  promptTextActive: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
  },

  // ── 리스트 ──
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 200,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ── 빈 상태 ──
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  emptyCta: {
    marginTop: SPACING.xl,
    width: '100%',
  },

  // ── 하단 분석 버튼 ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  analyzeBtn: {
    width: '100%',
  },
});
