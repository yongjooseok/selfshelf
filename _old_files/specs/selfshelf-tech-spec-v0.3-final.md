# SelfShelf — 기술 설계 최종 문서 v0.3 (개발 착수용 SSOT)

> **성격**: 기능 명세 + 데이터 스키마 + 와이어프레임 + 기술 스택 + 개발 로드맵 통합
> **버전 이력**: v1.0(기능명세) → v0.1(스키마/와이어) → v0.2(통합) → **v0.3(최종 확정)**
> **확정일**: 2026.02.10
> **상태**: 🟢 개발 착수 가능

---

# PART 1: 확정 사항 총정리

## 📌 기술 결정 11가지 (전부 확정)

| # | 결정 | 확정 내용 | 근거 |
|:---:|:---|:---|:---|
| 1 | 플랫폼 | React Native (Expo Managed) | 3~4주 일정에 Expo가 개발 속도 최적 |
| 2 | 언어 | 영어 + 한국어 동시 출시 | i18next로 관리 |
| 3 | 데이터 저장 | expo-sqlite (로컬 우선) | 계정 시스템 = +2주. v1.1에서 클라우드 |
| 4 | OCR 엔진 | expo-camera + react-native-mlkit (단발) | 실시간 OCR은 v1.1+. 실패 시 수동 입력 |
| 5 | 다중 촬영 | 최대 3장 | 원통형 용기 대부분 커버 |
| 6 | 성분 사전 | 200개 (활성 80 + 베이스 120) | 번들 JSON + 최초 실행 sqlite seed |
| 7 | 프리미엄 벽 | 등록 5개 + 기능 제한 | 빨노초 카드 전부 무료, 상세/가이드/워터마크 유료 |
| 8 | 캘린더 UI | v1.0 제외 | 텍스트 가이드로 대체 |
| 9 | ShareCard | view-shot + expo-sharing + expo-media-library | 뷰 캡처 방식이 가장 단순 |
| 10 | Manual input | 사전 검색 선택형 | 직접 타이핑보다 오류 적음 |
| 11 | 결제 | RevenueCat | 서버 없이 Paywall + entitlement 관리 |

---

## 💰 Free vs Premium 최종 (v0.3 확정)

### Free

| 기능 | 내용 |
|:---|:---|
| 제품 등록 | 최대 **5개** (OCR + 수동) |
| 충돌 카드 (빨강) | ✅ 요약 카드 |
| 주의 카드 (노랑) | ✅ 요약 카드 |
| 시너지 카드 (초록) | ✅ 요약 카드 |
| AM/PM 순서 | ✅ 기본 |
| 루틴 점수 | ✅ |
| 공유 카드 | ✅ (워터마크 포함) |

### Premium ($3.99/월 or $29.99/년)

| 기능 | 내용 |
|:---|:---|
| 제품 등록 | **무제한** |
| 상세 설명 | Why/Fix 심화 (교육 콘텐츠) |
| 텍스트 가이드 | 스킨사이클 분산 스케줄 ("월수금: Retinol / 화목토: AHA") |
| 공유 카드 | **워터마크 없음** |
| "이 제품 사도 될까?" | 구매 전 내 루틴 호환성 체크 |

**원칙**: 무료에서 "앱의 핵심 가치(충돌 발견)"를 충분히 체험 → 프리미엄은 "더 깊이 + 더 많이 + 더 예쁘게"

---

# PART 2: 기술 스택

## 🛠️ 최종 기술 스택

### Core

| 영역 | 라이브러리 | 버전/비고 |
|:---|:---|:---|
| Framework | Expo (Managed) | SDK 52+ |
| Navigation | expo-router | 파일 기반 라우팅 |
| DB | expo-sqlite | 로컬 우선 |
| State | Zustand | 가볍고 MVP에 최적 |
| i18n | i18next + expo-localization | en/ko 동시 |

### Camera & OCR

| 영역 | 라이브러리 | 비고 |
|:---|:---|:---|
| Camera | expo-camera | 촬영 + 갤러리 |
| Image 전처리 | expo-image-manipulator | 흑백 변환, 대비 강화, 크롭 |
| OCR | react-native-mlkit | on-device, 단발 OCR |

### Share & Output

| 영역 | 라이브러리 | 비고 |
|:---|:---|:---|
| 카드 생성 | react-native-view-shot | 뷰 → 이미지 캡처 |
| 공유 | expo-sharing | 네이티브 공유 시트 |
| 저장 | expo-media-library | 카메라롤에 저장 |

### Monetization

| 영역 | 라이브러리 | 비고 |
|:---|:---|:---|
| 인앱결제 | RevenueCat | Paywall + entitlement (서버 불필요) |

---

# PART 3: 데이터 스키마 (v0.3 최종)

## 변경 이력 (v0.2 → v0.3)

| 변경 | 내용 |
|:---|:---|
| ✏️ 수정 | Premium 정책: 노랑/초록 카드 무료화 반영. isPremium 체크 대상 변경 |
| ✏️ 수정 | Rule.type 'ordered'는 텍스트 가이드/주의 카드에서만 사용 (sort 로직에 미반영) |
| ➕ 추가 | AM/PM 제외 안내 메시지 필드 (AnalysisResult.exclusionNotes) |
| ➕ 추가 | DB 마이그레이션 규칙 (PRAGMA user_version) |
| ➕ 추가 | 이미지 전처리 파이프라인 명세 |
| ➖ 제거 | Finding.matched (ingredientsA/B와 중복) |

## TypeScript 타입 정의

```typescript
// ═══════════════════════════════════════
// USER
// ═══════════════════════════════════════

interface UserProfile {
  id: string
  skinType: 'dry' | 'oily' | 'combo' | 'sensitive'
  concerns: SkinConcern[]              // max 3
  language: 'en' | 'ko'
  isPremium: boolean
  createdAt: number
  updatedAt: number
}

type SkinConcern =
  | 'acne' | 'wrinkle' | 'pigmentation'
  | 'dryness' | 'pore' | 'sensitivity' | 'dullness'


// ═══════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════

interface Product {
  id: string
  name: string | null
  category: ProductCategory
  images: string[]                     // 로컬 URI, max 3
  ocrRawText: string                   // 원문 보존 (재분석용)
  extractedTokens: string[]            // OCR 토큰 (정규화 전)
  ingredients: IngredientInstance[]
  createdAt: number
  updatedAt: number
}

type ProductCategory =
  | 'cleanser' | 'toner' | 'essence' | 'serum'
  | 'ampoule' | 'cream' | 'sunscreen' | 'mask'
  | 'oil' | 'exfoliant' | 'other'

interface IngredientInstance {
  raw: string                          // OCR 원문
  canonicalId: string                  // → dictionary.id
  confidence: number                   // 0~1
  source: 'ocr' | 'manual' | 'search' // v0.3: 'search' 추가 (사전 검색)
  isActive: boolean
}


// ═══════════════════════════════════════
// INGREDIENT DICTIONARY (정적 번들)
// ═══════════════════════════════════════

interface IngredientDictionary {
  id: string                           // canonical: 'retinol'
  inciName: string                     // "Retinol"
  koName: string                       // "레티놀"
  aliases: string[]                    // 폭넓은 변형 포함
  class: IngredientClass[]
  isActive: boolean                    // true = 충돌 룰 대상
  description: { en: string; ko: string }
}

type IngredientClass =
  | 'retinoid' | 'aha' | 'bha' | 'vitamin_c'
  | 'niacinamide' | 'benzoyl_peroxide' | 'peptide'
  | 'ceramide' | 'hyaluronic_acid' | 'antioxidant'
  | 'soothing' | 'barrier' | 'exfoliant_class'
  | 'oil_class' | 'spf' | 'base'


// ═══════════════════════════════════════
// RULE (정적 번들)
// ═══════════════════════════════════════

interface Rule {
  id: string
  level: 1 | 2 | 3                    // 1=충돌 2=주의 3=시너지
  type: 'mutual' | 'ordered'          // mutual=양방향, ordered=순서의존
  // ⚠️ ordered 룰은 sort에 미반영, 텍스트 가이드/주의 카드에서만 사용
  a: string[]                          // canonicalId 그룹
  b: string[]                          // canonicalId 그룹
  title: { en: string; ko: string }
  reason: { en: string; ko: string }   // 무료: 요약 1줄
  reasonDetail: { en: string; ko: string } // 프리미엄: 심화 설명
  fix: { en: string; ko: string }      // 무료: 기본 조치
  fixDetail: { en: string; ko: string }   // 프리미엄: 상세 가이드
  severityWeight: number               // 1~10
}


// ═══════════════════════════════════════
// ANALYSIS RESULT
// ═══════════════════════════════════════

interface AnalysisResult {
  id: string
  productIds: string[]
  analyzedAt: number
  score: number                        // 0~100
  conflicts: Finding[]                 // Level 1
  cautions: Finding[]                  // Level 2
  synergies: Finding[]                 // Level 3
  amOrder: OrderedProduct[]
  pmOrder: OrderedProduct[]
  exclusionNotes: ExclusionNote[]      // v0.3 추가
  textGuide: { en: string; ko: string } // 프리미엄 전용 (스킨사이클)
  shareCard: ShareCardPayload
}

interface OrderedProduct {
  productId: string
  productName: string | null
  category: ProductCategory
  position: number                     // 1부터 시작
}

// v0.3: AM/PM 제외된 제품에 대한 안내
interface ExclusionNote {
  productId: string
  routine: 'am' | 'pm'
  message: { en: string; ko: string }
  // ex: { en: "Sunscreen is AM only", ko: "선크림은 AM 루틴 전용입니다" }
}

interface Finding {
  ruleId: string
  pair: {
    productAId: string
    productBId: string
  }
  ingredientsA: string[]
  ingredientsB: string[]
  message: { en: string; ko: string }  // 무료: 요약
  // 프리미엄 상세는 Rule.reasonDetail/fixDetail에서 조회
}

interface ShareCardPayload {
  imageUri: string | null
  score: number
  conflictCount: number
  cautionCount: number
  synergyCount: number
  amProductNames: string[]
  pmProductNames: string[]
  generatedAt: number
  hasWatermark: boolean                // !isPremium
}
```

---

## 🗄️ SQLite 테이블 설계

```sql
-- ═══════════════════════════════════════
-- 마이그레이션 관리
-- ═══════════════════════════════════════
-- PRAGMA user_version = 1;  (v1.0 초기)
-- 앱 시작 시 currentVersion 읽고, target까지 순차 마이그레이션
-- 개발 중: 실패 시 DB reset 허용
-- 출시 후: 실패 시 롤백 필수

-- ═══════════════════════════════════════
-- v1 스키마
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  skin_type TEXT NOT NULL,           -- 'dry'|'oily'|'combo'|'sensitive'
  concerns TEXT NOT NULL,            -- JSON array: '["acne","wrinkle"]'
  language TEXT NOT NULL DEFAULT 'en',
  is_premium INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT NOT NULL,
  ocr_raw_text TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  uri TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_ingredients (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  raw TEXT NOT NULL,
  canonical_id TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  source TEXT NOT NULL DEFAULT 'ocr',  -- 'ocr'|'manual'|'search'
  is_active INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_pi_canonical ON product_ingredients(canonical_id);

CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  product_ids TEXT NOT NULL,          -- JSON array
  score INTEGER NOT NULL,
  am_order TEXT NOT NULL,             -- JSON array of OrderedProduct
  pm_order TEXT NOT NULL,
  exclusion_notes TEXT NOT NULL DEFAULT '[]',  -- JSON array
  text_guide_en TEXT NOT NULL DEFAULT '',
  text_guide_ko TEXT NOT NULL DEFAULT '',
  share_card TEXT NOT NULL DEFAULT '{}', -- JSON ShareCardPayload
  analyzed_at INTEGER NOT NULL
);
CREATE INDEX idx_ar_date ON analysis_results(analyzed_at DESC);

CREATE TABLE IF NOT EXISTS analysis_findings (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  level INTEGER NOT NULL,             -- 1|2|3
  product_a_id TEXT NOT NULL,
  product_b_id TEXT NOT NULL,
  ingredients_a TEXT NOT NULL,         -- JSON array
  ingredients_b TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_ko TEXT NOT NULL
);

-- ═══════════════════════════════════════
-- 정적 데이터 (앱 번들 JSON → 최초 실행 시 seed)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS dictionary_ingredients (
  id TEXT PRIMARY KEY,                -- canonical key
  inci_name TEXT NOT NULL,
  ko_name TEXT NOT NULL,
  aliases TEXT NOT NULL,              -- JSON array
  class TEXT NOT NULL,                -- JSON array
  is_active INTEGER NOT NULL DEFAULT 0,
  desc_en TEXT NOT NULL DEFAULT '',
  desc_ko TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_di_active ON dictionary_ingredients(is_active);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL,
  type TEXT NOT NULL,                  -- 'mutual'|'ordered'
  group_a TEXT NOT NULL,              -- JSON array
  group_b TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ko TEXT NOT NULL,
  reason_en TEXT NOT NULL,
  reason_ko TEXT NOT NULL,
  reason_detail_en TEXT NOT NULL DEFAULT '',
  reason_detail_ko TEXT NOT NULL DEFAULT '',
  fix_en TEXT NOT NULL,
  fix_ko TEXT NOT NULL,
  fix_detail_en TEXT NOT NULL DEFAULT '',
  fix_detail_ko TEXT NOT NULL DEFAULT '',
  severity_weight INTEGER NOT NULL DEFAULT 5
);
```

---

## 🔬 핵심 로직 (v0.3 확정)

### 점수 계산

```typescript
function calculateScore(
  conflicts: Finding[],
  cautions: Finding[],
  synergies: Finding[],
  rules: Rule[]
): number {
  let score = 100

  for (const c of conflicts) {
    const rule = rules.find(r => r.id === c.ruleId)
    score -= (rule?.severityWeight ?? 5) * 3     // 충돌: -15 ~ -30
  }
  for (const c of cautions) {
    const rule = rules.find(r => r.id === c.ruleId)
    score -= (rule?.severityWeight ?? 3) * 1     // 주의: -3 ~ -10
  }
  for (const s of synergies) {
    score += 2                                    // 시너지: +2 (max cap)
  }

  return Math.max(0, Math.min(100, score))
}
```

### AM/PM 순서 결정

```typescript
const ORDER_WEIGHT: Record<ProductCategory, { am: number; pm: number }> = {
  cleanser:   { am: 1,  pm: 2 },
  toner:      { am: 2,  pm: 3 },
  essence:    { am: 3,  pm: 4 },
  serum:      { am: 4,  pm: 6 },
  ampoule:    { am: 5,  pm: 7 },
  cream:      { am: 7,  pm: 8 },
  sunscreen:  { am: 99, pm: -1 },    // AM 마지막, PM 제외
  mask:       { am: -1, pm: 9 },     // AM 제외
  oil:        { am: -1, pm: 10 },    // AM 제외, PM 최종
  exfoliant:  { am: -1, pm: 5 },     // PM only
  other:      { am: 6,  pm: 7 },
}

// -1 = 해당 루틴에서 제외 → ExclusionNote 생성
// 제외 메시지 예: "Sunscreen is for your AM routine only — skipped in PM"

const ACTIVE_PLACEMENT: Record<string, { slot: 'am' | 'pm'; order: number }> = {
  retinoid:         { slot: 'pm', order: 5 },
  vitamin_c:        { slot: 'am', order: 4 },
  aha:              { slot: 'pm', order: 5 },
  bha:              { slot: 'pm', order: 5 },
  benzoyl_peroxide: { slot: 'am', order: 4 },
  spf:              { slot: 'am', order: 99 },
}

// ordered 룰은 sort에 미반영.
// "AHA 먼저 → 10분 대기 → Niacinamide" 같은 건 Caution 카드 텍스트로만 안내.
```

### 성분 정규화 (Normalize) 파이프라인

```typescript
function normalizeToken(raw: string): NormalizeResult {
  // Step 1: 전처리
  let cleaned = raw
    .toLowerCase()
    .replace(/[^a-z가-힣0-9\s-]/g, '')  // 특수문자 제거
    .replace(/\s+/g, ' ')               // 공백 정리
    .replace(/\(.*?\)/g, '')            // 괄호+함량 제거
    .trim()

  // Step 2: Exact match (aliases 포함)
  const exact = dictionary.find(d =>
    d.id === cleaned ||
    d.inciName.toLowerCase() === cleaned ||
    d.koName === cleaned ||
    d.aliases.some(a => a.toLowerCase() === cleaned)
  )
  if (exact) return { canonicalId: exact.id, confidence: 1.0, source: 'exact' }

  // Step 3: Fuzzy match (레벤슈타인 거리)
  const candidates = dictionary
    .map(d => ({
      id: d.id,
      distance: Math.min(
        levenshtein(cleaned, d.inciName.toLowerCase()),
        levenshtein(cleaned, d.koName),
        ...d.aliases.map(a => levenshtein(cleaned, a.toLowerCase()))
      )
    }))
    .filter(c => c.distance <= 3)       // 허용 거리 3 이하
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)                         // top 3

  if (candidates.length > 0) {
    return {
      canonicalId: candidates[0].id,
      confidence: 1 - (candidates[0].distance * 0.2),  // 거리 1당 -0.2
      source: 'fuzzy',
      alternatives: candidates           // UI에서 유저에게 선택지 제공
    }
  }

  // Step 4: 미매칭 → 유저 수동 확인 요청
  return { canonicalId: 'unknown', confidence: 0, source: 'unmatched' }
}
```

### 이미지 전처리 (OCR 정확도 향상)

```typescript
import * as ImageManipulator from 'expo-image-manipulator'

async function preprocessForOCR(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      // 1. 적정 크기로 리사이즈 (너무 크면 OCR 느려짐)
      { resize: { width: 1200 } },
    ],
    {
      // 2. 압축 없이 고품질 유지
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
    }
  )
  return result.uri
  // 참고: ML Kit은 자체적으로 이진화/대비 보정을 하므로
  // 과도한 전처리는 오히려 역효과. 리사이즈만 해도 충분.
  // 추후 인식률 낮으면: grayscale 변환 추가 검토
}
```

---

# PART 4: 와이어프레임 (v0.3 확정)

## 네비게이션 구조

```
[Tab Bar: Home | Profile]
[Floating Action Button: 📷 Scan] (중앙)

Onboarding (최초 1회, 비로그인)
  └→ Camera

Home
  ├→ Scan (FAB) → Camera → Ingredient Review → Home
  ├→ View Analysis → Analysis → Share Card
  ├→ See All → My Shelf (전체 보기)
  └→ Product 탭 → Ingredient Review (수정)

Analysis
  ├→ [Why?] → BottomSheet (요약=무료, 상세=프리미엄)
  └→ [Share] → Share Card → Native Share

Profile
  ├→ Skin Edit → 저장 → 재분석 트리거
  ├→ Premium → RevenueCat Paywall
  └→ Account (v1.1)
```

## 상태별 Home 분기

```
제품 0개:
┌─────────────────────────────┐
│  Your skincare might be     │
│  fighting itself.           │
│                             │
│  [📷 Scan Your First       │
│       Product]              │
└─────────────────────────────┘

제품 1개:
┌─────────────────────────────┐
│  ✅ 1 product added          │
│  Add one more to analyze!   │
│                             │
│  [📷 Add Another Product]   │
└─────────────────────────────┘

제품 2개+:
┌─────────────────────────────┐
│  [Score: 72/100]            │
│  [⚠️ 2 conflicts]           │
│  [View Analysis →]          │
│                             │
│  [Today AM ☀️ / PM 🌙]      │
│  (순서 리스트)               │
│                             │
│  [My Shelf: 4 products]    │
│  (그리드 프리뷰)             │
│  [See All →]               │
└─────────────────────────────┘

제품 5개 (무료 한도):
┌─────────────────────────────┐
│  (위와 동일 +)              │
│  ┌──────────────────────┐   │
│  │ 🔒 Shelf full (5/5)   │   │
│  │ Unlock unlimited     │   │
│  │ [$3.99/month →]      │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

## Analysis 화면 — Free vs Premium 차이

```
Free 유저가 보는 것:
┌────────────────────────────┐
│ 🔴 Retinol + AHA            │
│ Don't use same night        │
│ [Why? 🔒] [Fix 🔒]         │  ← 탭하면 "Unlock details"
│                             │
│ (AM/PM 순서는 보임)         │
│ (텍스트 가이드는 안 보임)    │
└────────────────────────────┘

Premium 유저가 보는 것:
┌────────────────────────────┐
│ 🔴 Retinol + AHA            │
│ Don't use same night        │
│ [Why? →] [Fix →]           │  ← 탭하면 상세 BottomSheet
│                             │
│ 📋 Your Skin Cycle:         │
│ Mon/Wed/Fri: Retinol PM    │
│ Tue/Thu/Sat: AHA PM        │
│ Sun: Recovery Day 🧘       │
└────────────────────────────┘
```

---

# PART 5: 4주 개발 로드맵

## Week 1 — "스캔 → 저장" 수직 슬라이스

| 일 | 산출물 |
|:---|:---|
| Day 1-2 | Expo 프로젝트 셋업, expo-router 네비게이션(2탭+FAB), i18next 구조 |
| Day 3 | Onboarding 3장 (피부타입+고민 → 로컬 저장) |
| Day 4 | expo-camera 촬영 (max 3장) + 갤러리 + expo-image-manipulator 전처리 |
| Day 5 | react-native-mlkit OCR 연동 → 토큰 리스트 추출 |
| Day 6 | expo-sqlite 스키마 생성 + 마이그레이션 러너 + Product CRUD |
| Day 7 | Ingredient Review 화면 (토큰 표시 + 수정/삭제/추가) |
| **체크포인트** | **"제품 1개를 사진으로 등록하고 성분 리스트 확인" 데모 30초** |

## Week 2 — 성분 매핑 + 룰 엔진

| 일 | 산출물 |
|:---|:---|
| Day 8-9 | IngredientDictionary JSON 200개 구축 (활성 80 + 베이스 120 + aliases) |
| Day 10 | normalize 파이프라인 (전처리 → exact → fuzzy) + 유저 확정 UI |
| Day 11 | 사전 검색 UI (Manual input 대안: 성분명 검색 → 선택) |
| Day 12 | Rule JSON 23개 (빨강 10 + 노랑 5 + 초록 8) + sqlite seed |
| Day 13 | 룰 매칭 엔진: 제품 쌍 순회 → Finding 생성 → 중복 제거 |
| Day 14 | 점수 계산 + Finding message 생성 (en/ko) |
| **체크포인트** | **"2개 제품 등록 → 충돌 1건 + 점수 출력" 데모** |

## Week 3 — Analysis 화면 + AM/PM 순서 + 프리미엄

| 일 | 산출물 |
|:---|:---|
| Day 15-16 | Analysis 화면: 점수 게이지 + 빨노초 카드 리스트 |
| Day 17 | BottomSheet (Why/Fix): 무료=요약, 프리미엄=상세 분기 |
| Day 18 | AM/PM 순서 정렬 + 제외 안내 메시지 ("Sunscreen is AM only") |
| Day 19 | 텍스트 가이드 생성 (프리미엄: 스킨사이클 분산) |
| Day 20 | Home 통합 (점수+루틴+My Shelf) + 상태별 분기 (0/1/2+/5개) |
| Day 21 | RevenueCat Paywall + isPremium 토글 + 5개 제한 로직 |
| **체크포인트** | **"핵심 가치 화면(Analysis) + Free/Premium 분기 완성" 데모** |

## Week 4 — 공유 카드 + 폴리시 + 스토어 준비

| 일 | 산출물 |
|:---|:---|
| Day 22-23 | ShareCard 렌더 (9:16) + view-shot → 이미지 생성 |
| Day 24 | 워터마크 토글 (Free=있음/Premium=없음) + expo-sharing 연동 |
| Day 25 | OCR 실패 플로우: 재촬영 유도 + 수동 입력 폴백 완성 |
| Day 26 | My Shelf 전체 보기 + 제품 편집/삭제 + 스와이프 삭제 |
| Day 27 | 문구 최종 점검 (en/ko) + 디스클레이머 + 개인정보 안내 (로컬 only) |
| Day 28 | TestFlight/내부 배포 + 크래시 수정 + 스토어 스크린샷 + 1분 소개 영상 |
| **체크포인트** | **"앱스토어 제출 준비 완료"** |

---

## ⚠️ 주차별 리스크 & 완화

| 주차 | 리스크 | 확률 | 완화 |
|:---|:---|:---:|:---|
| W1 | ML Kit Expo 호환 이슈 | 중 | Day 4에 조기 검증. 실패 시 expo-camera 캡처 → Cloud Vision(최소 연동)으로 전환 |
| W2 | OCR 인식률 < 60% | 중 | 전처리 강화 + fuzzy 허용 거리 확대 + 수동 보정 UX 강화로 보완 |
| W2 | 성분 사전 200개 구축 시간 | 낮 | CosIng DB + 한국 식약처 공개 데이터 기반. 기계적 변환 후 수동 검수 |
| W3 | RevenueCat 설정 복잡 | 낮 | 개발 중엔 isPremium 토글로 QA. 실제 결제 연동은 W4 초반 |
| W4 | 앱스토어 리뷰 리젝 | 중 | "의료 조언 아님" 디스클레이머 필수. 건강 카테고리 대신 라이프스타일 카테고리 |

---

# PART 6: v1.0 이후 로드맵

| 버전 | 기능 | 예상 시기 |
|:---|:---|:---|
| **v1.1** | Cloud Vision 폴백, 캘린더 UI, 알림/리마인더, 소셜 로그인 | 출시 후 2~4주 |
| **v1.2** | 대안 제품 추천 (어필리에이트), PDF 리포트, 계절 알림 | 출시 후 1~2개월 |
| **v2.0** | 클라우드 동기화 (Supabase), 바코드 스캔, 제품 DB 확장 | 출시 후 3개월+ |
| **v2.1+** | 커뮤니티, 유저 리뷰, AI 맞춤 추천 | MAU 10K+ 달성 후 |

---

# PART 7: 프로젝트 파일 구조 (Expo)

```
selfshelf/
├── app/                          # expo-router 라우팅
│   ├── _layout.tsx               # 루트 레이아웃 (탭바)
│   ├── (tabs)/
│   │   ├── index.tsx             # Home
│   │   └── profile.tsx           # Profile
│   ├── onboarding.tsx
│   ├── scan.tsx                  # Camera
│   ├── review.tsx                # Ingredient Review
│   ├── shelf.tsx                 # My Shelf (전체 보기)
│   ├── analysis.tsx              # Analysis Result
│   └── share.tsx                 # Share Card Preview
│
├── components/
│   ├── ScoreGauge.tsx
│   ├── FindingCard.tsx           # 빨/노/초 카드
│   ├── ProductCard.tsx
│   ├── RoutineList.tsx           # AM/PM 순서
│   ├── ShareCardView.tsx         # view-shot 대상
│   ├── IngredientChip.tsx
│   ├── PaywallSheet.tsx
│   └── BottomSheet.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts             # CREATE TABLE statements
│   │   ├── migrate.ts            # 마이그레이션 러너
│   │   ├── seed.ts               # dictionary + rules seed
│   │   └── queries.ts            # CRUD 함수
│   ├── ocr/
│   │   ├── scan.ts               # ML Kit 호출
│   │   └── preprocess.ts         # 이미지 전처리
│   ├── engine/
│   │   ├── normalize.ts          # 성분 정규화 파이프라인
│   │   ├── analyze.ts            # 룰 매칭 + Finding 생성
│   │   ├── score.ts              # 점수 계산
│   │   ├── order.ts              # AM/PM 순서 정렬
│   │   └── textGuide.ts          # 텍스트 가이드 생성
│   └── i18n/
│       ├── config.ts
│       ├── en.json
│       └── ko.json
│
├── store/
│   └── useStore.ts               # Zustand
│
├── assets/
│   ├── data/
│   │   ├── ingredients.json      # 200개 성분 사전
│   │   └── rules.json            # 23개 룰
│   └── images/
│
├── app.json                      # Expo 설정
├── eas.json                      # EAS Build 설정
└── package.json
```

---

*본 문서는 SelfShelf v1.0 개발의 단일 기준 문서(SSOT)입니다.*
*모든 개발 판단은 이 문서를 기준으로 합니다.*
*변경 시 버전 번호를 올리고 변경 이력을 기록합니다.*
