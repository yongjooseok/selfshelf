import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductStore } from '../src/store/productStore';
import { useOCR } from '../src/hooks/useOCR';
import { matchIngredients } from '../src/engine/matcher';
import { Button } from '../src/components/Button';
import type { ProductCategory, Ingredient } from '../src/engine/types';
import { PRODUCT_CATEGORIES } from '../src/engine/types';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
} from '../src/utils/constants';
import ingredientsData from '../assets/data/ingredients.json';

const ingredients = ingredientsData as Ingredient[];

export default function RegisterScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ scannedText?: string }>();
  const addProduct = useProductStore((s) => s.add);
  const { recognize, processing: ocrProcessing } = useOCR();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);

  const lang = i18n.language as 'ko' | 'en';

  // Scan 탭에서 전달된 텍스트 수신
  useEffect(() => {
    if (params.scannedText) {
      setRawText(params.scannedText);
    }
  }, [params.scannedText]);

  // 입력 텍스트에서 실시간 성분 매칭
  const matchedIds = useMemo(() => {
    if (!rawText.trim()) return [];
    return matchIngredients(rawText, ingredients);
  }, [rawText]);

  const matchedIngredients = useMemo(() => {
    return matchedIds.map((id) => {
      const ing = ingredients.find((i) => i.id === id);
      return {
        id,
        name: ing ? (lang === 'ko' ? ing.koName : ing.inciName) : id,
        isActive: ing?.isActive ?? false,
      };
    });
  }, [matchedIds, lang]);

  // ── 인라인 스캔 (카메라/갤러리) ──
  const handleInlineScan = async () => {
    Alert.alert(
      t('register.scanBtn'),
      undefined,
      [
        {
          text: t('scan.gallery'),
          onPress: () => pickAndOCR('gallery'),
        },
        {
          text: '📷 ' + t('scan.title'),
          onPress: () => pickAndOCR('camera'),
        },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  };

  const pickAndOCR = async (source: 'camera' | 'gallery') => {
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]) return;

    try {
      const text = await recognize(result.assets[0].uri);
      if (text.trim()) {
        setRawText(text);
      } else {
        Alert.alert(t('scan.fail'), t('scan.failRetry'));
      }
    } catch {
      Alert.alert(t('scan.fail'), t('scan.failRetry'));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await addProduct({
        name: name.trim(),
        brand: brand.trim(),
        category: category ?? 'other',
        ingredients: matchedIds,
        rawText: rawText.trim(),
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const canSave = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + SPACING.sm,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeBtn}>{t('common.close')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('register.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── 제품명 ── */}
        <Text style={styles.label}>{t('register.name._self')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('register.name.placeholder')}
          placeholderTextColor={COLORS.textSub}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        {/* ── 브랜드 ── */}
        <Text style={styles.label}>{t('register.brand._self')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('register.brand.placeholder')}
          placeholderTextColor={COLORS.textSub}
          value={brand}
          onChangeText={setBrand}
        />

        {/* ── 카테고리 칩 ── */}
        <Text style={styles.label}>{t('register.category._self')}</Text>
        <View style={styles.chipGrid}>
          {PRODUCT_CATEGORIES.map((key) => {
            const isSelected = category === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setCategory(isSelected ? null : key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {t(`register.category.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 성분 입력 ── */}
        <Text style={styles.label}>{t('register.ingredients._self')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('register.ingredients.placeholder')}
          placeholderTextColor={COLORS.textSub}
          value={rawText}
          onChangeText={setRawText}
          multiline
          textAlignVertical="top"
        />

        {/* 스캔 버튼 */}
        <TouchableOpacity
          style={styles.scanBtn}
          activeOpacity={0.7}
          onPress={handleInlineScan}
          disabled={ocrProcessing}
        >
          {ocrProcessing ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Text style={styles.scanBtnText}>📷  {t('register.scanBtn')}</Text>
          )}
        </TouchableOpacity>

        {/* ── 매칭된 성분 ── */}
        {matchedIngredients.length > 0 && (
          <View style={styles.matchedBox}>
            <View style={styles.matchedHeader}>
              <View style={styles.matchedDot} />
              <Text style={styles.matchedCount}>
                {matchedIngredients.length}
                {lang === 'ko' ? '개 성분 인식됨' : ' ingredients matched'}
              </Text>
            </View>
            <View style={styles.matchedChips}>
              {matchedIngredients.map((ing) => (
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

        {/* ── 저장 버튼 ── */}
        <Button
          title={t('register.save')}
          onPress={handleSave}
          loading={saving}
          disabled={!canSave}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
  },

  // ── 헤더 ──
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeBtn: {
    fontSize: FONT_SIZE.md,
    color: COLORS.accent,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },

  // ── 필드 ──
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    lineHeight: 22,
  },

  // ── 카테고리 칩 ──
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSub,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ── 스캔 버튼 ──
  scanBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
  },
  scanBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── 매칭 결과 ──
  matchedBox: {
    marginTop: SPACING.md,
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

  // ── 저장 ──
  saveBtn: {
    marginTop: SPACING.xl,
    width: '100%',
  },
});
