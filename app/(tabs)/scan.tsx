import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOCR } from '../../src/hooks/useOCR';
import { matchIngredients } from '../../src/engine/matcher';
import { Button } from '../../src/components/Button';
import type { Ingredient } from '../../src/engine/types';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../../src/utils/constants';
import ingredientsData from '../../assets/data/ingredients.json';

const ingredients = ingredientsData as Ingredient[];

type Phase = 'camera' | 'processing' | 'review';

export default function ScanScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = i18n.language as 'ko' | 'en';

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { recognize } = useOCR();

  const [phase, setPhase] = useState<Phase>('camera');
  const [ocrText, setOcrText] = useState('');
  const [ocrError, setOcrError] = useState(false);
  const [navigatedAway, setNavigatedAway] = useState(false);

  // Register에서 돌아올 때 카메라로 복귀
  useFocusEffect(
    useCallback(() => {
      if (navigatedAway) {
        setPhase('camera');
        setOcrText('');
        setOcrError(false);
        setNavigatedAway(false);
      }
    }, [navigatedAway]),
  );

  // ── 매칭된 성분 ──
  const matchedIds = useMemo(() => {
    if (!ocrText.trim()) return [];
    return matchIngredients(ocrText, ingredients);
  }, [ocrText]);

  const matchedList = useMemo(() => {
    return matchedIds.map((id) => {
      const ing = ingredients.find((i) => i.id === id);
      return {
        id,
        name: ing ? (lang === 'ko' ? ing.koName : ing.inciName) : id,
        isActive: ing?.isActive ?? false,
      };
    });
  }, [matchedIds, lang]);

  // ── OCR 실행 ──
  const runOCR = useCallback(
    async (uri: string) => {
      setPhase('processing');
      setOcrError(false);
      try {
        const text = await recognize(uri);
        if (!text.trim()) {
          setOcrError(true);
        }
        setOcrText(text);
        setPhase('review');
      } catch {
        setOcrError(true);
        setOcrText('');
        setPhase('review');
      }
    },
    [recognize],
  );

  // ── 촬영 ──
  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      await runOCR(photo.uri);
    }
  };

  // ── 갤러리 선택 ──
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await runOCR(result.assets[0].uri);
    }
  };

  // ── 다시 촬영 ──
  const handleRetry = () => {
    setPhase('camera');
    setOcrText('');
    setOcrError(false);
  };

  // ── 확인 완료 → Register로 이동 ──
  const handleConfirm = () => {
    setNavigatedAway(true);
    router.push({
      pathname: '/register',
      params: { scannedText: ocrText },
    });
  };

  // ════════════════════════════════════════
  // 권한 미허용 상태
  // ════════════════════════════════════════
  if (!permission?.granted) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <View style={styles.permIcon}>
          <Text style={styles.permIconText}>📷</Text>
        </View>
        <Text style={styles.permTitle}>{t('scan.permission.title')}</Text>
        <Text style={styles.permBody}>{t('scan.permission.body')}</Text>
        <Button
          title={t('scan.permission.allow')}
          onPress={requestPermission}
          size="lg"
          style={styles.permBtn}
        />
      </View>
    );
  }

  // ════════════════════════════════════════
  // 처리 중
  // ════════════════════════════════════════
  if (phase === 'processing') {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.processingText}>{t('scan.processing')}</Text>
      </View>
    );
  }

  // ════════════════════════════════════════
  // 인식 결과 확인 (review)
  // ════════════════════════════════════════
  if (phase === 'review') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.reviewScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <Text style={styles.reviewHeader}>{t('scan.confirm')}</Text>

          {/* 에러 상태 */}
          {ocrError && !ocrText.trim() && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>{t('scan.fail')}</Text>
              <Text style={styles.errorBody}>{t('scan.failRetry')}</Text>
            </View>
          )}

          {/* 편집 가능 텍스트 */}
          <Text style={styles.reviewLabel}>{t('scan.edit')}</Text>
          <TextInput
            style={styles.reviewInput}
            value={ocrText}
            onChangeText={setOcrText}
            multiline
            textAlignVertical="top"
            placeholder={t('register.ingredients.placeholder')}
            placeholderTextColor={COLORS.textSub}
          />

          {/* 매칭된 성분 */}
          {matchedList.length > 0 && (
            <View style={styles.matchedBox}>
              <View style={styles.matchedHeader}>
                <View style={styles.matchedDot} />
                <Text style={styles.matchedCount}>
                  {matchedList.length}
                  {lang === 'ko' ? '개 성분 인식됨' : ' ingredients matched'}
                </Text>
              </View>
              <View style={styles.matchedChips}>
                {matchedList.map((ing) => (
                  <View
                    key={ing.id}
                    style={[
                      styles.matchedChip,
                      ing.isActive && styles.matchedChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchedChipText,
                        ing.isActive && styles.matchedChipTextActive,
                      ]}
                    >
                      {ing.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 하단 버튼 */}
        <View
          style={[
            styles.reviewBottom,
            { paddingBottom: Math.max(insets.bottom, 16) + 84 },
          ]}
        >
          <Button
            title={t('scan.done')}
            onPress={handleConfirm}
            disabled={!ocrText.trim()}
            size="lg"
            style={styles.reviewBtnPrimary}
          />
          <Button
            title={t('scan.retry')}
            variant="secondary"
            onPress={handleRetry}
            size="lg"
            style={styles.reviewBtnSecondary}
          />
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════
  // 카메라 뷰파인더
  // ════════════════════════════════════════
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* 상단 가이드 */}
        <View style={[styles.overlay, { paddingTop: insets.top + SPACING.md }]}>
          <Text style={styles.guideText}>{t('scan.guide')}</Text>
        </View>

        {/* 중앙 프레임 */}
        <View style={styles.frameWrap}>
          <View style={styles.frame} />
        </View>

        {/* 하단 컨트롤 */}
        <View
          style={[
            styles.cameraBottom,
            { paddingBottom: Math.max(insets.bottom, 16) + 84 },
          ]}
        >
          {/* 갤러리 */}
          <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
            <Text style={styles.sideBtnText}>{t('scan.gallery')}</Text>
          </TouchableOpacity>

          {/* 촬영 버튼 */}
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          {/* Spacer */}
          <View style={styles.sideBtn} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },

  // ── 권한 요청 ──
  permIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  permIconText: {
    fontSize: 36,
  },
  permTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  permBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  permBtn: {
    marginTop: SPACING.xl,
    width: '100%',
  },

  // ── 처리 중 ──
  processingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    marginTop: SPACING.lg,
  },

  // ── 카메라 ──
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingBottom: SPACING.md,
  },
  guideText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '80%',
    aspectRatio: 3 / 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: BORDER_RADIUS.md,
  },
  cameraBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sideBtn: {
    width: 80,
    alignItems: 'center',
  },
  sideBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: '500',
    textAlign: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.white,
  },

  // ── 리뷰 ──
  reviewScroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 180,
  },
  reviewHeader: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },
  reviewLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  reviewInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    paddingTop: 14,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 120,
    lineHeight: 22,
  },

  // 에러
  errorBox: {
    backgroundColor: COLORS.redBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,77,106,0.3)',
  },
  errorTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.red,
    marginBottom: SPACING.xs,
  },
  errorBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
    lineHeight: 20,
  },

  // 매칭 결과
  matchedBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  matchedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  matchedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  matchedCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.green,
  },
  matchedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  matchedChip: {
    backgroundColor: 'rgba(52,211,153,0.10)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: BORDER_RADIUS.sm,
  },
  matchedChipActive: {
    backgroundColor: 'rgba(124,106,255,0.10)',
  },
  matchedChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.green,
    fontWeight: '500',
  },
  matchedChipTextActive: {
    color: COLORS.accent,
  },

  // 하단 버튼
  reviewBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewBtnPrimary: {
    flex: 1,
  },
  reviewBtnSecondary: {
    flex: 1,
  },
});
