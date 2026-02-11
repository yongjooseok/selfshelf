import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProductStore } from '../src/store/productStore';
import { useHistoryStore } from '../src/store/historyStore';
import { analyzeMultipleProducts } from '../src/engine/analyzer';
import { ResultCard } from '../src/components/ResultCard';
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import type { Ingredient, Rule, AnalysisResult } from '../src/engine/types';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../src/utils/constants';
import ingredientsData from '../assets/data/ingredients.json';
import rulesData from '../assets/data/rules.json';

const ingredients = ingredientsData as Ingredient[];
const rules = rulesData as Rule[];

const ingredientMap: Record<string, Ingredient> = {};
for (const ing of ingredients) {
  ingredientMap[ing.id] = ing;
}

export default function ResultsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ productIds: string }>();
  const getById = useProductStore((s) => s.getById);
  const addHistory = useHistoryStore((s) => s.add);
  const [saved, setSaved] = useState(false);

  const productIds = (params.productIds ?? '').split(',').filter(Boolean);
  const products = productIds
    .map((id) => getById(id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  const notFound = productIds.length > 0 && products.length < productIds.length;

  const matches = useMemo(() => {
    if (products.length < 2) return [];
    return analyzeMultipleProducts(products, rules);
  }, [products]);

  const redCount = matches.filter((m) => m.severity === 'red').length;
  const yellowCount = matches.filter((m) => m.severity === 'yellow').length;
  const greenCount = matches.filter((m) => m.severity === 'green').length;

  // 요약 텍스트: danger > warning > safe
  const summaryText =
    redCount > 0
      ? t('results.danger')
      : yellowCount > 0
        ? t('results.warning')
        : t('results.safe');

  const summaryColor =
    redCount > 0
      ? COLORS.red
      : yellowCount > 0
        ? COLORS.yellow
        : COLORS.green;

  const handleSave = async () => {
    const result: AnalysisResult = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      productIds,
      matches,
      createdAt: new Date().toISOString(),
    };
    await addHistory(result);
    setSaved(true);
  };

  const productNames = products.map((p) => p.name).join(' × ');

  const handleShare = useCallback(async () => {
    const lang = i18n.language as 'ko' | 'en';
    const lines: string[] = [`[SelfShelf] ${productNames}`];
    lines.push('');
    if (redCount > 0) lines.push(`${t('results.card.conflict')}: ${redCount}`);
    if (yellowCount > 0) lines.push(`${t('results.card.caution')}: ${yellowCount}`);
    if (greenCount > 0) lines.push(`${t('results.card.synergy')}: ${greenCount}`);
    lines.push('');
    for (const m of matches) {
      const label =
        m.severity === 'red'
          ? t('results.card.conflict')
          : m.severity === 'yellow'
            ? t('results.card.caution')
            : t('results.card.synergy');
      lines.push(`[${label}] ${m.rule.title[lang]}`);
    }
    await Share.share({ message: lines.join('\n') });
  }, [matches, redCount, yellowCount, greenCount, productNames, t, i18n.language]);

  // ── 리스트 헤더: 요약 섹션 ──
  const renderSummary = () => (
    <View style={styles.summarySection}>
      {/* 삭제된 제품 경고 */}
      {notFound && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            {i18n.language === 'ko'
              ? '일부 제품이 삭제되어 결과가 다를 수 있어요'
              : 'Some products were deleted, results may differ'}
          </Text>
        </View>
      )}

      {/* 제품 조합명 */}
      <Text style={styles.productNames} numberOfLines={2}>
        {productNames}
      </Text>

      {/* 요약 한줄 */}
      <Text style={[styles.summaryText, { color: summaryColor }]}>
        {summaryText}
      </Text>

      {/* 배지 행 */}
      {(redCount > 0 || yellowCount > 0 || greenCount > 0) && (
        <View style={styles.badgeRow}>
          {redCount > 0 && (
            <Badge
              label={t('results.card.conflict')}
              severity="red"
              count={redCount}
            />
          )}
          {yellowCount > 0 && (
            <Badge
              label={t('results.card.caution')}
              severity="yellow"
              count={yellowCount}
            />
          )}
          {greenCount > 0 && (
            <Badge
              label={t('results.card.synergy')}
              severity="green"
              count={greenCount}
            />
          )}
        </View>
      )}
    </View>
  );

  // ── 빈 결과 (안심 조합) ──
  const renderSafeState = () => (
    <View style={styles.safeWrap}>
      <View style={styles.safeIcon}>
        <Text style={styles.safeIconText}>✅</Text>
      </View>
      <Text style={styles.safeTitle}>{t('results.safe')}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── 상단 네비게이션 ── */}
      <View style={styles.navBar}>
        <Button
          title={t('common.back')}
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        />
        <Text style={styles.navTitle}>{t('results.title')}</Text>
        <View style={styles.navSpacer} />
      </View>

      {/* ── 결과 카드 리스트 ── */}
      <FlatList
        data={matches}
        keyExtractor={(item) => item.ruleId}
        ListHeaderComponent={renderSummary}
        renderItem={({ item }) => (
          <ResultCard
            match={item}
            ingredientMap={ingredientMap}
            onPremiumPress={() => router.push('/paywall')}
          />
        )}
        ListEmptyComponent={renderSafeState}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* ── 하단 버튼바 ── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.bottomRow}>
          <Button
            title={saved ? t('common.done') : t('results.save')}
            onPress={saved ? () => router.back() : handleSave}
            size="lg"
            disabled={saved}
            style={styles.bottomBtnPrimary}
          />
          <Button
            title={t('results.share')}
            variant="secondary"
            onPress={handleShare}
            size="lg"
            style={styles.bottomBtnShare}
          />
        </View>
        <Button
          title={t('results.reanalyze')}
          variant="ghost"
          onPress={() => router.back()}
          size="sm"
          style={styles.reanalyzeBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── 네비게이션 ──
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  navTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  navSpacer: {
    width: 50,
  },

  // ── 요약 섹션 ──
  summarySection: {
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  warningBanner: {
    backgroundColor: COLORS.yellowBg,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.3)',
  },
  warningText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.yellow,
    textAlign: 'center',
  },
  productNames: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    marginBottom: SPACING.sm,
  },
  summaryText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  // ── 리스트 ──
  list: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 140,
  },

  // ── 안심 조합 ──
  safeWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  safeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  safeIconText: {
    fontSize: 28,
  },
  safeTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.green,
  },

  // ── 하단 버튼바 ──
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
  bottomRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bottomBtnPrimary: {
    flex: 2,
  },
  bottomBtnShare: {
    flex: 1,
  },
  reanalyzeBtn: {
    marginTop: SPACING.sm,
    alignSelf: 'center',
  },
});
