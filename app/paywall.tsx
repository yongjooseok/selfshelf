import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/settingsStore';
import { Button } from '../src/components/Button';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../src/utils/constants';

type Plan = 'yearly' | 'monthly';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setPremium = useSettingsStore((s) => s.setPremium);

  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // 로컬 토글 (RevenueCat 실제 연동 없이)
      await setPremium(true);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    // 로컬: 이미 premium이면 안내, 아니면 복원 불가 안내
    const isPremium = useSettingsStore.getState().isPremium;
    if (isPremium) {
      Alert.alert(t('error.purchase.restored'));
    } else {
      Alert.alert(t('error.purchase.noRestore'));
    }
  };

  const features = ['feature1', 'feature2', 'feature3', 'feature4'] as const;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + SPACING.md,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      {/* 닫기 */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.closeBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.closeText}>{t('common.close')}</Text>
      </TouchableOpacity>

      {/* 타이틀 */}
      <Text style={styles.title}>{t('paywall.title')}</Text>
      <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

      {/* 혜택 목록 */}
      <View style={styles.features}>
        {features.map((key) => (
          <View key={key} style={styles.featureRow}>
            <Text style={styles.featureText}>{t(`paywall.${key}`)}</Text>
          </View>
        ))}
      </View>

      {/* 플랜 선택 */}
      <View style={styles.plans}>
        {/* 연간 */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planSelected,
          ]}
          onPress={() => setSelectedPlan('yearly')}
          activeOpacity={0.7}
        >
          {/* 할인 배지 */}
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>
              {t('paywall.yearlySave')}
            </Text>
          </View>
          <Text
            style={[
              styles.planLabel,
              selectedPlan === 'yearly' && styles.planLabelSelected,
            ]}
          >
            {t('paywall.yearly')}
          </Text>
          <Text
            style={[
              styles.planPrice,
              selectedPlan === 'yearly' && styles.planPriceSelected,
            ]}
          >
            {t('paywall.yearlyPrice')}
          </Text>
        </TouchableOpacity>

        {/* 월간 */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planSelected,
          ]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.planLabel,
              selectedPlan === 'monthly' && styles.planLabelSelected,
            ]}
          >
            {t('paywall.monthly')}
          </Text>
          <Text
            style={[
              styles.planPrice,
              selectedPlan === 'monthly' && styles.planPriceSelected,
            ]}
          >
            {t('paywall.monthlyPrice')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 무료 체험 배지 */}
      <View style={styles.trialBadge}>
        <Text style={styles.trialText}>{t('paywall.freeTrial')}</Text>
      </View>

      {/* 구독 버튼 */}
      <Button
        title={t('paywall.subscribe')}
        onPress={handleSubscribe}
        loading={loading}
        size="lg"
        style={styles.subscribeBtn}
      />

      {/* 구매 복원 */}
      <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
        <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
      </TouchableOpacity>

      {/* 약관 */}
      <Text style={styles.terms}>{t('paywall.terms')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
  },
  closeBtn: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.accent,
    fontWeight: '500',
  },

  // 타이틀
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // 혜택
  features: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 24,
  },

  // 플랜
  plans: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  planSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(124,106,255,0.08)',
  },
  planLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  planLabelSelected: {
    color: COLORS.accentLight,
  },
  planPrice: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 4,
  },
  planPriceSelected: {
    color: COLORS.accent,
  },
  saveBadge: {
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  saveBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.green,
  },

  // 무료 체험
  trialBadge: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    backgroundColor: 'rgba(124,106,255,0.10)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  trialText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // 구독 버튼
  subscribeBtn: {
    marginTop: SPACING.lg,
    width: '100%',
  },

  // 복원
  restoreBtn: {
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  restoreText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
  },

  // 약관
  terms: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
