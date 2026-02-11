import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { RuleMatch, Ingredient } from '../engine/types';
import { useSettingsStore } from '../store/settingsStore';
import {
  COLORS,
  SEVERITY_COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../utils/constants';

interface ResultCardProps {
  match: RuleMatch;
  ingredientMap: Record<string, Ingredient>;
  onPremiumPress?: () => void;
}

export function ResultCard({
  match,
  ingredientMap,
  onPremiumPress,
}: ResultCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const isPremium = useSettingsStore((s) => s.isPremium);
  const [expanded, setExpanded] = useState(false);

  const color = SEVERITY_COLORS[match.severity];
  const rule = match.rule;
  const isLocked = match.severity === 'red' && !isPremium;

  const ingA = ingredientMap[match.ingredientA];
  const ingB = ingredientMap[match.ingredientB];

  // i18n 기반 type 라벨
  const typeLabel =
    match.severity === 'red'
      ? t('results.card.conflict')
      : match.severity === 'yellow'
        ? t('results.card.caution')
        : t('results.card.synergy');

  // i18n 기반 type 설명
  const typeDesc =
    match.severity === 'red'
      ? t('results.card.conflictDesc')
      : match.severity === 'yellow'
        ? t('results.card.cautionDesc')
        : t('results.card.synergyDesc');

  const toggleExpand = () => {
    if (!isLocked) setExpanded((prev) => !prev);
  };

  const ingLabel = (ing: Ingredient | undefined, fallback: string) =>
    ing ? (lang === 'ko' ? `${ing.koName} (${ing.inciName})` : ing.inciName) : fallback;

  return (
    <View style={[styles.card, { borderLeftColor: color.main }]}>
      {/* ── 헤더 (항상 노출) ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {/* 배지 + 펼치기 표시 */}
        <View style={styles.headerTop}>
          <View style={[styles.typeBadge, { backgroundColor: color.bg }]}>
            <Text style={[styles.typeBadgeText, { color: color.main }]}>
              {typeLabel}
            </Text>
          </View>
          {!isLocked && (
            <Text style={styles.expandHint}>
              {expanded ? t('common.close') : t('results.detail._self')}
            </Text>
          )}
        </View>

        {/* 규칙 제목 */}
        <Text style={styles.ruleTitle}>{rule.title[lang]}</Text>

        {/* 간단 이유 */}
        <Text style={styles.ruleReason}>{rule.reason[lang]}</Text>
      </TouchableOpacity>

      {/* ── 프리미엄 잠금 (빨강 + 비프리미엄) ── */}
      {isLocked && (
        <TouchableOpacity style={styles.lockedBar} onPress={onPremiumPress}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <View style={styles.lockedTextWrap}>
            <Text style={styles.lockedText}>
              {t('results.premium.locked')}
            </Text>
            <Text style={styles.unlockLink}>
              {t('results.premium.unlock')}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── 아코디언 상세 (펼쳤을 때) ── */}
      {expanded && !isLocked && (
        <View style={styles.detail}>
          {/* 타입 설명 */}
          <Text style={[styles.typeDescText, { color: color.main }]}>
            {typeDesc}
          </Text>

          {/* 관련 성분 */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>
              {t('results.detail.ingredient')}
            </Text>
            <View style={styles.ingredientRow}>
              <View style={[styles.ingredientChip, { borderColor: color.main }]}>
                <Text style={[styles.ingredientChipText, { color: color.main }]}>
                  {ingLabel(ingA, match.ingredientA)}
                </Text>
              </View>
              <Text style={styles.ingredientPlus}>+</Text>
              <View style={[styles.ingredientChip, { borderColor: color.main }]}>
                <Text style={[styles.ingredientChipText, { color: color.main }]}>
                  {ingLabel(ingB, match.ingredientB)}
                </Text>
              </View>
            </View>
          </View>

          {/* 상세 이유 */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>
              {t('results.detail.reason')}
            </Text>
            <Text style={styles.detailValue}>{rule.reasonDetail[lang]}</Text>
          </View>

          {/* 사용 팁 */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>{t('results.detail.tip')}</Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>{rule.fixDetail[lang]}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },

  // ── 헤더 ──
  header: {
    padding: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  expandHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
  },
  ruleTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  ruleReason: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    lineHeight: 20,
  },

  // ── 프리미엄 잠금 ──
  lockedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124,106,255,0.06)',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  lockedIcon: {
    fontSize: 16,
  },
  lockedTextWrap: {
    flex: 1,
  },
  lockedText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
  },
  unlockLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 2,
  },

  // ── 아코디언 상세 ──
  detail: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  typeDescText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  detailSection: {
    marginTop: SPACING.md,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
  },

  // 성분 칩
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  ingredientChip: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
  },
  ingredientChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  ingredientPlus: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    fontWeight: '600',
  },

  // 팁 박스
  tipBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
});
