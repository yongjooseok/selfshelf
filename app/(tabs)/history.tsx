import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistoryStore } from '../../src/store/historyStore';
import { useProductStore } from '../../src/store/productStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Badge } from '../../src/components/Badge';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  FREE_HISTORY_LIMIT,
} from '../../src/utils/constants';
import type { AnalysisResult } from '../../src/engine/types';

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const allRecords = useHistoryStore((s) => s.records);
  const removeRecord = useHistoryStore((s) => s.remove);
  const getProductById = useProductStore((s) => s.getById);
  const isPremium = useSettingsStore((s) => s.isPremium);

  const lang = i18n.language as 'ko' | 'en';
  const records = isPremium
    ? allRecords
    : allRecords.slice(0, FREE_HISTORY_LIMIT);

  const handleDelete = (id: string) => {
    Alert.alert(t('history.delete'), t('history.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeRecord(id),
      },
    ]);
  };

  const handleTap = (item: AnalysisResult) => {
    router.push({
      pathname: '/results',
      params: { productIds: item.productIds.join(',') },
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (lang === 'ko') {
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: AnalysisResult }) => {
    const productNames = item.productIds
      .map((id) => getProductById(id)?.name ?? '?')
      .join(' × ');

    const redCount = item.matches.filter((m) => m.severity === 'red').length;
    const yellowCount = item.matches.filter(
      (m) => m.severity === 'yellow',
    ).length;
    const greenCount = item.matches.filter(
      (m) => m.severity === 'green',
    ).length;

    const summaryColor =
      redCount > 0
        ? COLORS.red
        : yellowCount > 0
          ? COLORS.yellow
          : COLORS.green;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleTap(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        {/* 상단: 제품명 + 날짜 */}
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {productNames}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* 요약 배지 */}
        <View style={styles.cardBottom}>
          <View style={[styles.statusDot, { backgroundColor: summaryColor }]} />
          <View style={styles.badges}>
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
        </View>
      </TouchableOpacity>
    );
  };

  const isLimited = !isPremium && allRecords.length > FREE_HISTORY_LIMIT;

  const renderFooter = () =>
    isLimited ? (
      <TouchableOpacity
        style={styles.limitBanner}
        onPress={() => router.push('/paywall')}
        activeOpacity={0.7}
      >
        <Text style={styles.limitText}>
          {lang === 'ko'
            ? `최근 ${FREE_HISTORY_LIMIT}건만 표시됩니다. 프리미엄으로 전체 보기`
            : `Showing last ${FREE_HISTORY_LIMIT} records. Upgrade for full history`}
        </Text>
      </TouchableOpacity>
    ) : null;

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>{t('history.empty')}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{t('history.title')}</Text>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.list,
          records.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    letterSpacing: -0.5,
  },

  // ── 리스트 ──
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ── 카드 ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
    marginRight: SPACING.sm,
  },
  cardDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },

  // ── 제한 배너 ──
  limitBanner: {
    backgroundColor: 'rgba(124,106,255,0.08)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  limitText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── 빈 상태 ──
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
  },
});
