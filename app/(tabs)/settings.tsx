import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../../src/utils/constants';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPremium = useSettingsStore((s) => s.isPremium);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          // Week 3+: 실제 계정 삭제 로직
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 120,
      }}
    >
      <Text style={styles.title}>{t('settings.title')}</Text>

      {/* ── 계정 섹션 ── */}
      <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
      <View style={styles.section}>
        <SettingsRow
          label={t('settings.premium')}
          value={isPremium ? t('settings.premiumActive') : undefined}
          onPress={() => router.push('/paywall')}
          showArrow
        />
        <SettingsRow
          label={t('settings.language')}
          value={language === 'ko' ? '한국어' : 'English'}
          onPress={toggleLanguage}
        />
        <SettingsRow
          label={t('settings.notification')}
          onPress={() => {}}
          showArrow
          isLast
        />
      </View>

      {/* ── 정보 섹션 ── */}
      <Text style={styles.sectionTitle}>{t('settings.info')}</Text>
      <View style={styles.section}>
        <SettingsRow
          label={t('settings.version')}
          value="1.0.0"
        />
        <SettingsRow
          label={t('settings.terms')}
          onPress={() => {}}
          showArrow
        />
        <SettingsRow
          label={t('settings.privacy')}
          onPress={() => {}}
          showArrow
        />
        <SettingsRow
          label={t('settings.licenses')}
          onPress={() => {}}
          showArrow
        />
        <SettingsRow
          label={t('settings.contact')}
          onPress={() => {}}
          showArrow
        />
        <SettingsRow
          label={t('settings.rate')}
          onPress={() => {}}
          showArrow
          isLast
        />
      </View>

      {/* ── 데이터 섹션 ── */}
      <Text style={styles.sectionTitle}>{t('settings.data')}</Text>
      <View style={styles.section}>
        <SettingsRow
          label={t('settings.export')}
          onPress={() => {}}
          showArrow
        />
        <SettingsRow
          label={t('settings.deleteAccount')}
          onPress={handleDeleteAccount}
          destructive
          isLast
        />
      </View>
    </ScrollView>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
  showArrow,
  destructive,
  isLast,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  destructive?: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value != null && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && <Text style={styles.rowArrow}>›</Text>}
      </View>
    </TouchableOpacity>
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
    paddingBottom: SPACING.sm,
    letterSpacing: -0.5,
  },

  // ── 섹션 ──
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSub,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  // ── 행 ──
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  rowLabelDestructive: {
    color: COLORS.red,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rowValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
  },
  rowArrow: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSub,
    fontWeight: '300',
  },
});
