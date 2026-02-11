import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/settingsStore';
import { Button } from '../src/components/Button';
import { COLORS, FONT_SIZE, SPACING } from '../src/utils/constants';

const SLIDE_ICONS = ['🧴', '📷', '🟢'];

interface SlideData {
  key: string;
  titleKey: string;
  bodyKey: string;
  icon: string;
}

const SLIDES: SlideData[] = [
  { key: '1', titleKey: 'onboarding.slide1.title', bodyKey: 'onboarding.slide1.body', icon: SLIDE_ICONS[0] },
  { key: '2', titleKey: 'onboarding.slide2.title', bodyKey: 'onboarding.slide2.body', icon: SLIDE_ICONS[1] },
  { key: '3', titleKey: 'onboarding.slide3.title', bodyKey: 'onboarding.slide3.body', icon: SLIDE_ICONS[2] },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const setHasSeenOnboarding = useSettingsStore((s) => s.setHasSeenOnboarding);

  const flatListRef = useRef<FlatList<SlideData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinish = async () => {
    await setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
      <Text style={styles.slideBody}>{t(item.bodyKey)}</Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 20 },
      ]}
    >
      {/* ── 건너뛰기 ── */}
      <View style={styles.topBar}>
        {!isLast ? (
          <TouchableOpacity onPress={handleFinish} hitSlop={12}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/* ── 슬라이드 ── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* ── 하단: 인디케이터 + 버튼 ── */}
      <View style={styles.bottom}>
        {/* 페이지 인디케이터 */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* 버튼 */}
        <Button
          title={isLast ? t('onboarding.start') : t('onboarding.next')}
          onPress={handleNext}
          size="lg"
          style={styles.btn}
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

  // ── 상단 ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    fontWeight: '500',
  },

  // ── 슬라이드 ──
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconText: {
    fontSize: 44,
  },
  slideTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  slideBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 24,
  },

  // ── 하단 ──
  bottom: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  btn: {
    width: '100%',
  },
});
