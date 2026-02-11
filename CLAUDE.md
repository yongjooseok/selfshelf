# CLAUDE.md — SelfShelf 프로젝트 핸드오프

> 이 문서는 Claude Code가 프로젝트 컨텍스트를 파악하고 즉시 개발에 착수하기 위한 통합 지시서입니다.
> 모든 기획·설계는 완료된 상태이며, 이 문서를 기반으로 코딩을 시작합니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|:---|:---|
| **앱 이름** | SelfShelf |
| **의미** | Self(나) + Shelf(화장대/선반) = 내 화장대 관리 |
| **핵심 기능** | 스킨케어 제품 성분 충돌/궁합 분석기 |
| **타겟** | 여러 스킨케어 제품을 함께 쓰는 20~40대 여성 |
| **플랫폼** | iOS 우선, Android 동시 지원 (Expo) |
| **언어** | 한국어(기본), 영어 |

### 핵심 플로우
```
제품 등록 (OCR 스캔 or 수동 입력)
    → 내 선반에 저장
    → 2개 이상 제품 선택
    → 성분 충돌/궁합 분석
    → 빨강(충돌)/노랑(주의)/초록(시너지) 카드로 결과 표시
```

---

## 2. 기술 스택 (확정)

| 영역 | 기술 | 비고 |
|:---|:---|:---|
| **프레임워크** | Expo (React Native) | Managed workflow, SDK 52+ |
| **언어** | TypeScript | strict mode |
| **네비게이션** | Expo Router (file-based) | app/ 디렉토리 기반 |
| **OCR** | Google ML Kit (react-native-mlkit-ocr) | on-device, 무료 |
| **카메라** | expo-camera | 권한 관리 포함 |
| **이미지 선택** | expo-image-picker | 갤러리 접근 |
| **로컬 저장** | AsyncStorage | 제품/분석기록 |
| **결제** | RevenueCat (react-native-purchases) | 구독 관리 |
| **i18n** | i18next + react-i18next | ko/en |
| **상태관리** | Zustand | 가벼운 전역 상태 |
| **스타일링** | NativeWind (Tailwind for RN) 또는 StyleSheet | 선택 가능 |

### 설치 명령어
```bash
# 프로젝트 생성
npx create-expo-app selfshelf --template expo-template-blank-typescript
cd selfshelf

# 핵심 의존성
npx expo install expo-camera expo-image-picker @react-native-async-storage/async-storage
npm install react-native-mlkit-ocr react-native-purchases
npm install i18next react-i18next zustand
npm install expo-router react-native-screens react-native-safe-area-context

# 개발 의존성
npm install -D @types/react
```

---

## 3. 프로젝트 구조

```
selfshelf/
├── CLAUDE.md                    ← 이 문서
├── app/                         ← Expo Router 페이지
│   ├── _layout.tsx              ← Root Layout (탭 네비게이션)
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← Tab Layout
│   │   ├── index.tsx            ← Home (내 선반)
│   │   ├── scan.tsx             ← 스캔 진입점
│   │   ├── history.tsx          ← 분석 기록
│   │   └── settings.tsx         ← 설정
│   ├── register.tsx             ← 제품 등록 (모달)
│   ├── results.tsx              ← 분석 결과
│   ├── paywall.tsx              ← 프리미엄 구독
│   └── onboarding.tsx           ← 온보딩 (첫 실행)
│
├── src/
│   ├── components/              ← 재사용 UI 컴포넌트
│   │   ├── ProductCard.tsx
│   │   ├── ResultCard.tsx       ← 빨강/노랑/초록 카드
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── TabBar.tsx
│   │
│   ├── engine/                  ← 성분 분석 엔진 (핵심 로직)
│   │   ├── analyzer.ts          ← 충돌 분석 메인 함수
│   │   ├── matcher.ts           ← 성분명 매칭 (alias 처리)
│   │   └── types.ts             ← 타입 정의
│   │
│   ├── store/                   ← Zustand 스토어
│   │   ├── productStore.ts      ← 제품 CRUD
│   │   ├── historyStore.ts      ← 분석 기록
│   │   └── settingsStore.ts     ← 설정/프리미엄 상태
│   │
│   ├── i18n/                    ← 다국어
│   │   ├── index.ts             ← i18next 설정
│   │   ├── ko.json              ← 한국어 (i18n 카피시트 기반)
│   │   └── en.json              ← 영어
│   │
│   ├── hooks/                   ← 커스텀 훅
│   │   ├── useOCR.ts            ← ML Kit OCR 래퍼
│   │   ├── usePurchase.ts       ← RevenueCat 래퍼
│   │   └── useAnalysis.ts       ← 분석 실행 훅
│   │
│   └── utils/
│       ├── constants.ts         ← 색상, 사이즈 상수
│       └── storage.ts           ← AsyncStorage 헬퍼
│
├── assets/
│   ├── data/
│   │   ├── ingredients.json     ← 성분 사전 (200개) ★
│   │   └── rules.json           ← 충돌 규칙 (23개) ★
│   └── images/
│       └── onboarding/
│
└── docs/                        ← 참조 문서 (개발용)
    ├── selfshelf-tech-spec-v0.3-final.md
    ├── selfshelf-budget-analysis-v1.md
    └── selfshelf-i18n-copysheet-v1.xlsx
```

---

## 4. 기존 산출물 위치 (iCloud)

Mac에서 아래 경로에 기획 산출물이 있습니다. 프로젝트 초기화 후 필요한 파일을 복사합니다.

```bash
DOCS="$HOME/Library/Mobile Documents/com~apple~CloudDocs/ai-agency/projects/selfshelf"

# 데이터 파일을 프로젝트에 복사
cp "$DOCS/data/selfshelf-ingredients.json" ./assets/data/ingredients.json
cp "$DOCS/data/selfshelf-rules.json" ./assets/data/rules.json

# 참조 문서 복사
mkdir -p docs
cp "$DOCS/specs/selfshelf-tech-spec-v0.3-final.md" ./docs/
cp "$DOCS/specs/selfshelf-budget-analysis-v1.md" ./docs/
```

---

## 5. 데이터 스키마

### 5.1 성분 사전 (ingredients.json)

```typescript
interface Ingredient {
  id: string;           // "ING_001"
  name_en: string;      // "Retinol"
  name_ko: string;      // "레티놀"
  category: string;     // "active" | "base" | "preservative" | ...
  aliases: string[];    // ["레티놀", "비타민A", "Retinol", "retinol", "RETINOL"]
  description_ko: string;
  description_en: string;
  common_products: string[];  // ["크림", "세럼"]
}
```

- **총 200개 성분**: 활성 성분 80개 + 기본 성분 120개
- **aliases 배열**이 핵심: OCR 텍스트 매칭 시 aliases를 순회하며 성분 식별
- aliases에는 한글/영문/대소문자 변형 모두 포함

### 5.2 규칙 (rules.json)

```typescript
interface Rule {
  id: string;              // "RULE_001"
  type: "conflict" | "caution" | "synergy";
  severity: "red" | "yellow" | "green";
  ingredient_a: string;    // "ING_001" (성분 ID 참조)
  ingredient_b: string;    // "ING_015"
  title_ko: string;        // "레티놀 + 비타민C"
  title_en: string;
  description_ko: string;  // 상세 설명
  description_en: string;
  tip_ko: string;          // 사용 팁
  tip_en: string;
  source: string;          // 출처
}
```

- **총 23개 규칙**: 빨강(충돌) 10개 + 노랑(주의) 5개 + 초록(시너지) 8개
- ingredient_a, ingredient_b는 ingredients.json의 id를 참조

### 5.3 제품 (로컬 저장)

```typescript
interface Product {
  id: string;              // UUID
  name: string;            // "비타민C 세럼"
  brand: string;           // "코스알엑스"
  category: ProductCategory;
  ingredients: string[];   // 매칭된 성분 ID 배열 ["ING_001", "ING_015"]
  rawText: string;         // OCR 원본 텍스트
  createdAt: string;       // ISO datetime
  imageUri?: string;       // 성분표 사진 (선택)
}

type ProductCategory =
  | "toner" | "serum" | "cream" | "cleanser"
  | "sunscreen" | "mask" | "other";
```

### 5.4 분석 결과 (로컬 저장)

```typescript
interface AnalysisResult {
  id: string;
  products: string[];       // 제품 ID 배열
  results: RuleMatch[];     // 매칭된 규칙들
  createdAt: string;
}

interface RuleMatch {
  ruleId: string;           // rules.json의 ID
  type: "conflict" | "caution" | "synergy";
  severity: "red" | "yellow" | "green";
  ingredientA: string;      // 성분 ID
  ingredientB: string;
  productA: string;         // 제품 ID (어떤 제품에서 온 성분인지)
  productB: string;
}
```

---

## 6. 핵심 엔진 로직 (analyzer.ts)

```typescript
// 의사코드 - 실제 구현 시 참고
function analyzeProducts(productA: Product, productB: Product, rules: Rule[]): RuleMatch[] {
  const matches: RuleMatch[] = [];

  for (const rule of rules) {
    const aHasIngA = productA.ingredients.includes(rule.ingredient_a);
    const aHasIngB = productA.ingredients.includes(rule.ingredient_b);
    const bHasIngA = productB.ingredients.includes(rule.ingredient_a);
    const bHasIngB = productB.ingredients.includes(rule.ingredient_b);

    // 교차 매칭: A제품의 성분과 B제품의 성분 간 규칙 확인
    if ((aHasIngA && bHasIngB) || (aHasIngB && bHasIngA)) {
      matches.push({
        ruleId: rule.id,
        type: rule.type,
        severity: rule.severity,
        ingredientA: rule.ingredient_a,
        ingredientB: rule.ingredient_b,
        productA: productA.id,
        productB: productB.id,
      });
    }
  }

  // 정렬: 빨강 → 노랑 → 초록
  return matches.sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return order[a.severity] - order[b.severity];
  });
}
```

### OCR → 성분 매칭 (matcher.ts)

```typescript
function matchIngredients(ocrText: string, dictionary: Ingredient[]): string[] {
  const normalizedText = ocrText.toLowerCase().replace(/\s+/g, ' ');
  const matchedIds: string[] = [];

  for (const ingredient of dictionary) {
    for (const alias of ingredient.aliases) {
      if (normalizedText.includes(alias.toLowerCase())) {
        if (!matchedIds.includes(ingredient.id)) {
          matchedIds.push(ingredient.id);
        }
        break; // 하나라도 매칭되면 다음 성분으로
      }
    }
  }

  return matchedIds;
}
```

---

## 7. 화면별 구현 가이드

### 7.1 Onboarding (onboarding.tsx)
- 3장의 슬라이드 (Swiper 또는 FlatList horizontal)
- 슬라이드 내용은 i18n 키 `onboarding.*` 참조
- `건너뛰기` / `다음` / `시작하기` 버튼
- AsyncStorage에 `hasSeenOnboarding` 플래그 저장
- 첫 실행 시에만 표시, 이후 홈으로 직행

### 7.2 Home — 내 선반 (tabs/index.tsx)
- 등록된 제품 목록 (FlatList)
- 제품 선택(체크박스) → 2개 이상 선택 시 `궁합 분석` 버튼 활성화
- 빈 상태 UI (제품 없을 때)
- FAB 버튼 → 제품 등록(register) 화면으로 이동
- 스와이프 삭제 지원

### 7.3 Scan (tabs/scan.tsx)
- expo-camera로 실시간 뷰파인더
- 촬영 → ML Kit OCR 실행 → 인식된 텍스트 표시
- 인식 결과 확인 화면: 성분 목록 + 수정 가능
- `확인 완료` → register 화면으로 성분 데이터 전달
- 갤러리 선택 대안 경로

### 7.4 Register (register.tsx)
- 제품명, 브랜드, 카테고리(칩 선택), 성분 목록
- 성분 입력: 스캔 결과 자동 채움 또는 수동 텍스트 입력
- `스캔으로 입력` 버튼 → Scan 화면으로 이동
- 저장 → productStore에 추가 → 홈으로 복귀

### 7.5 Results (results.tsx)
- 상단: 제품 조합 표시 + 요약 배지 (충돌 N, 주의 N, 시너지 N)
- 카드 목록: 빨강/노랑/초록 카드 (아코디언 펼치기)
- 카드 내용: 관련 성분, 이유, 사용 팁, 출처
- **프리미엄 잠금**: 빨강 카드의 상세 분석은 프리미엄 전용
  - 노랑/초록 카드는 무료로 전체 공개
- `결과 공유` / `결과 저장` / `다른 조합 분석` 버튼

### 7.6 History (tabs/history.tsx)
- 분석 기록 목록 (날짜순 정렬)
- 각 기록: 제품 조합명 + 충돌/주의/시너지 배지 + 날짜
- 탭하면 results 화면으로 이동 (저장된 결과 표시)
- 스와이프 삭제

### 7.7 Paywall (paywall.tsx)
- 프리미엄 혜택 목록 4개
- 월간(₩3,900) / 연간(₩29,900, 36% 할인) 플랜 선택
- 7일 무료 체험 배지
- RevenueCat으로 구독 처리
- `구매 복원` 링크

### 7.8 Settings (tabs/settings.tsx)
- 섹션: 계정, 정보, 데이터
- 프리미엄 관리 → paywall 화면
- 언어 선택 (한국어/영어)
- 이용약관, 개인정보처리방침 (WebView 링크)
- 데이터 내보내기, 계정 삭제, 로그아웃

---

## 8. 수익 모델 (프리미엄 정책)

### Free 티어
- 제품 등록: **무제한**
- OCR 스캔: **무제한**
- 궁합 분석: **무제한**
- 노랑(주의) 카드: **전체 공개** (이유 + 팁 + 출처)
- 초록(시너지) 카드: **전체 공개**
- 빨강(충돌) 카드: **요약만** (제목 + 한 줄 설명)
- 분석 기록: **최근 10건**
- 광고: 배너 있음

### Premium 티어
- 빨강(충돌) 카드: **상세 분석** (이유 + 팁 + 출처 + 대안 성분)
- 분석 기록: **무제한**
- 광고 제거
- 가격: 월 ₩3,900 / 연 ₩29,900 (36% 할인)
- 7일 무료 체험

### 프리미엄 체크 로직
```typescript
// settingsStore.ts
interface SettingsState {
  isPremium: boolean;
  // ...
}

// ResultCard.tsx에서 사용
if (card.severity === 'red' && !isPremium) {
  // 잠금 UI 표시 + "프리미엄으로 잠금 해제" 버튼
} else {
  // 전체 상세 내용 표시
}
```

---

## 9. 디자인 토큰

```typescript
// src/utils/constants.ts
export const COLORS = {
  bg: '#0F0F14',
  surface: '#1A1A24',
  surfaceLight: '#242432',
  accent: '#7C6AFF',
  accentLight: '#9B8AFF',

  // 카드 색상
  red: '#FF4D6A',
  redBg: 'rgba(255,77,106,0.12)',
  yellow: '#FFB830',
  yellowBg: 'rgba(255,184,48,0.12)',
  green: '#34D399',
  greenBg: 'rgba(52,211,153,0.12)',

  text: '#F0F0F5',
  textSub: '#8888A0',
  border: '#2A2A3A',
};

// 탭 아이콘
export const TAB_ICONS = {
  home: '🏠',    // 내 선반
  scan: '📷',    // 스캔
  history: '📋', // 기록
  settings: '⚙️', // 설정
};
```

---

## 10. i18n 키 구조

i18n 카피시트(selfshelf-i18n-copysheet-v1.xlsx)를 기반으로 JSON 생성.

```
ko.json / en.json 키 구조:

onboarding.slide1.title
onboarding.slide1.body
onboarding.slide2.title  ...
onboarding.skip / next / start

home.title / subtitle / empty.title / empty.body / empty.cta
home.addProduct / analyze / selectPrompt / product.delete

scan.title / guide / processing / retry / confirm / edit / done
scan.fail / failRetry / permission.title / permission.body / gallery

register.title / name / brand / category.* / ingredients / scanBtn / save

results.title / subtitle / safe / warning / danger
results.card.conflict / caution / synergy / ...Desc
results.detail / share / save / reanalyze
results.premium.locked / unlock

history.title / empty / date / conflicts / cautions / synergies

paywall.title / subtitle / feature1~4 / monthly / yearly / ...Price
paywall.subscribe / restore / terms / freeTrial

settings.title / account / premium / notification / language / ...

tab.home / scan / history / settings

common.confirm / cancel / delete / save / close / back / ...
```

### i18n JSON 생성 방법
카피시트 xlsx에서 ko/en 열을 추출하여 JSON으로 변환:
```bash
# 카피시트를 JSON으로 변환하는 스크립트가 필요하면 요청하세요
# 또는 수동으로 ko.json, en.json 작성
```

---

## 11. 개발 로드맵 (4주)

### Week 1: 기반 + 핵심 플로우
- [ ] Expo 프로젝트 초기화 + TypeScript 설정
- [ ] Expo Router 파일 구조 세팅
- [ ] Zustand 스토어 구성 (product, history, settings)
- [ ] 데이터 파일 복사 (ingredients.json, rules.json)
- [ ] i18n 설정 + ko.json/en.json 생성
- [ ] Home 화면 (제품 목록 + 선택 + 빈 상태)
- [ ] Register 화면 (수동 입력 방식)
- [ ] 분석 엔진 구현 (analyzer.ts + matcher.ts)
- [ ] Results 화면 (빨강/노랑/초록 카드)

### Week 2: OCR + 카메라
- [ ] expo-camera 연동 + 권한 처리
- [ ] ML Kit OCR 연동 (react-native-mlkit-ocr)
- [ ] Scan 화면 (촬영 → OCR → 결과 확인)
- [ ] OCR 텍스트 → 성분 매칭 파이프라인
- [ ] Register에 스캔 결과 연동
- [ ] 갤러리 이미지 선택 경로

### Week 3: 부가 기능 + 프리미엄
- [ ] History 화면 (기록 목록 + 삭제)
- [ ] Settings 화면 (전체 항목)
- [ ] Onboarding 화면 (3슬라이드)
- [ ] Paywall 화면 UI
- [ ] RevenueCat 연동 (구독 + 복원)
- [ ] 프리미엄 잠금 로직 (빨강 카드 상세)
- [ ] 결과 공유 기능 (Share API)

### Week 4: 마무리 + 출시 준비
- [ ] 실기기 테스트 (iOS + Android)
- [ ] 에러 처리 + 엣지 케이스
- [ ] 앱 아이콘 + 스플래시 화면
- [ ] App Store 메타데이터 (카피시트 AppStore 키 참조)
- [ ] TestFlight / Internal Testing 배포
- [ ] 스토어 심사 제출

---

## 12. 주의사항 / 컨벤션

### 코드 컨벤션
- TypeScript strict mode
- 컴포넌트: PascalCase (ProductCard.tsx)
- 훅: camelCase, use 접두사 (useOCR.ts)
- 스토어: camelCase (productStore.ts)
- 상수: UPPER_SNAKE_CASE

### 명명 규칙
- 앱 이름: "SelfShelf" (CamelCase, 공백 없음)
- 패키지명: com.selfshelf.app (또는 com.creamhouse.selfshelf)
- 색상 참조: COLORS 상수만 사용, 하드코딩 금지

### 데이터 관련
- ingredients.json과 rules.json은 앱 번들에 포함 (네트워크 불필요)
- 제품/분석 결과는 AsyncStorage에 로컬 저장
- 데이터 마이그레이션 고려: 스키마 버전 필드 추가

### 프리미엄 관련
- RevenueCat entitlement ID: "premium"
- 오프라인에서도 프리미엄 상태 캐싱 필요
- 7일 무료 체험 → 자동 갱신 구독

---

## 13. 개발 시작 커맨드

```bash
# 1. 프로젝트 생성
npx create-expo-app selfshelf --template expo-template-blank-typescript
cd selfshelf

# 2. 의존성 설치
npx expo install expo-camera expo-image-picker expo-sharing
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-screens react-native-safe-area-context
npm install react-native-mlkit-ocr react-native-purchases
npm install i18next react-i18next zustand
npm install expo-router

# 3. 데이터 파일 복사
mkdir -p assets/data docs
DOCS="$HOME/Library/Mobile Documents/com~apple~CloudDocs/ai-agency/projects/selfshelf"
cp "$DOCS/data/selfshelf-ingredients.json" ./assets/data/ingredients.json
cp "$DOCS/data/selfshelf-rules.json" ./assets/data/rules.json
cp "$DOCS/specs/"* ./docs/

# 4. 개발 서버 시작
npx expo start
```

---

## 14. 산출물 체크리스트

| 산출물 | 상태 | 위치 |
|:---|:---:|:---|
| 기능 명세서 v1.0 | ✅ | docs/selfshelf-tech-spec-v0.3-final.md |
| 예산 분석 | ✅ | docs/selfshelf-budget-analysis-v1.md |
| 성분 사전 (200개) | ✅ | assets/data/ingredients.json |
| 충돌 규칙 (23개) | ✅ | assets/data/rules.json |
| i18n 카피시트 | ✅ | docs/selfshelf-i18n-copysheet-v1.xlsx |
| 와이어프레임 (8화면) | ✅ | claude.ai 아티팩트 (참조용) |
| 이 문서 (CLAUDE.md) | ✅ | 프로젝트 루트 |

---

> **이 문서를 읽었다면, Week 1 태스크부터 순서대로 시작하세요.**
> 질문이 있으면 이 문서의 해당 섹션을 참조하거나, docs/ 폴더의 스펙 문서를 확인하세요.
