/**
 * 전체 플로우 통합 테스트
 *
 * OCR 텍스트 → matchIngredients → Product 생성 → analyzeProducts → RuleMatch 결과
 * 이 테스트는 Scan → Register → Save → Home → Results 플로우의 데이터 계층을 검증합니다.
 */
import { matchIngredients } from '../matcher';
import { analyzeProducts, analyzeMultipleProducts } from '../analyzer';
import type { Ingredient, Product, Rule } from '../types';
import ingredientsData from '../../../assets/data/ingredients.json';
import rulesData from '../../../assets/data/rules.json';

const ingredients = ingredientsData as Ingredient[];
const rules = rulesData as Rule[];

// ── 헬퍼: OCR 텍스트 → 제품 생성 ──
function createProductFromOCR(
  name: string,
  rawText: string,
  id = 'test-' + Math.random().toString(36).slice(2),
): Product {
  const matchedIds = matchIngredients(rawText, ingredients);
  return {
    id,
    name,
    brand: '',
    category: 'serum',
    ingredients: matchedIds,
    rawText,
    createdAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════
// 1. OCR → Product 생성 플로우
// ════════════════════════════════════════
describe('OCR text → Product creation', () => {
  test('OCR text converts to product with matched ingredients', () => {
    const ocrText = 'Water, Glycerin, Niacinamide, Retinol, Tocopherol';
    const product = createProductFromOCR('비타민 세럼', ocrText);

    expect(product.name).toBe('비타민 세럼');
    expect(product.rawText).toBe(ocrText);
    expect(product.ingredients).toContain('water');
    expect(product.ingredients).toContain('glycerin');
    expect(product.ingredients).toContain('niacinamide');
    expect(product.ingredients).toContain('retinol');
    expect(product.ingredients).toContain('tocopherol');
  });

  test('Korean OCR text converts correctly', () => {
    const ocrText = '정제수, 글리세린, 나이아신아마이드, 히알루론산';
    const product = createProductFromOCR('수분 토너', ocrText);

    expect(product.ingredients).toContain('water');
    expect(product.ingredients).toContain('glycerin');
    expect(product.ingredients).toContain('niacinamide');
    expect(product.ingredients).toContain('hyaluronic_acid');
  });
});

// ════════════════════════════════════════
// 2. 충돌 감지 (레티놀 + AHA)
// ════════════════════════════════════════
describe('Conflict detection: Retinol + AHA', () => {
  const productA = createProductFromOCR(
    '레티놀 세럼',
    'Water, Retinol, Tocopherol',
    'prod-a',
  );
  const productB = createProductFromOCR(
    'AHA 토너',
    'Water, Glycolic Acid, Butylene Glycol',
    'prod-b',
  );

  test('productA contains retinol', () => {
    expect(productA.ingredients).toContain('retinol');
  });

  test('productB contains glycolic_acid', () => {
    expect(productB.ingredients).toContain('glycolic_acid');
  });

  test('analysis detects red-level conflict', () => {
    const matches = analyzeProducts(productA, productB, rules);
    const red = matches.filter((m) => m.severity === 'red');
    expect(red.length).toBeGreaterThan(0);
  });

  test('conflict is rule R01_retinoid_aha', () => {
    const matches = analyzeProducts(productA, productB, rules);
    const r01 = matches.find((m) => m.ruleId === 'R01_retinoid_aha');
    expect(r01).toBeDefined();
    expect(r01?.severity).toBe('red');
    expect(r01?.ingredientA).toBe('retinol');
    expect(r01?.ingredientB).toBe('glycolic_acid');
  });
});

// ════════════════════════════════════════
// 3. 충돌 감지 (레티놀 + BHA)
// ════════════════════════════════════════
describe('Conflict detection: Retinol + BHA', () => {
  test('detects retinoid + salicylic acid conflict', () => {
    const productA = createProductFromOCR(
      '레티놀 크림',
      'Water, Retinol',
      'ret-cream',
    );
    const productB = createProductFromOCR(
      'BHA 세럼',
      'Water, Salicylic Acid',
      'bha-serum',
    );

    const matches = analyzeProducts(productA, productB, rules);
    const r02 = matches.find((m) => m.ruleId === 'R02_retinoid_bha');
    expect(r02).toBeDefined();
    expect(r02?.severity).toBe('red');
  });
});

// ════════════════════════════════════════
// 4. 충돌 감지 (레티놀 + 벤조일퍼옥사이드)
// ════════════════════════════════════════
describe('Conflict detection: Retinol + Benzoyl Peroxide', () => {
  test('detects retinoid + BP conflict', () => {
    const productA = createProductFromOCR(
      '레티놀 세럼',
      'Water, Retinol',
      'ret-ser',
    );
    const productB = createProductFromOCR(
      'BP 크림',
      'Water, Benzoyl Peroxide',
      'bp-cream',
    );

    const matches = analyzeProducts(productA, productB, rules);
    const r03 = matches.find((m) => m.ruleId === 'R03_retinoid_benzoyl_peroxide');
    expect(r03).toBeDefined();
    expect(r03?.severity).toBe('red');
  });
});

// ════════════════════════════════════════
// 5. 안심 조합 (충돌 없음)
// ════════════════════════════════════════
describe('Safe combination (no conflicts)', () => {
  test('niacinamide + hyaluronic acid = no red/yellow', () => {
    const productA = createProductFromOCR(
      '나이아신 세럼',
      'Water, Niacinamide',
      'nia-ser',
    );
    const productB = createProductFromOCR(
      '히알루론 토너',
      'Water, Hyaluronic Acid',
      'ha-toner',
    );

    const matches = analyzeProducts(productA, productB, rules);
    const red = matches.filter((m) => m.severity === 'red');
    const yellow = matches.filter((m) => m.severity === 'yellow');
    expect(red.length).toBe(0);
    expect(yellow.length).toBe(0);
  });
});

// ════════════════════════════════════════
// 6. 다중 제품 분석
// ════════════════════════════════════════
describe('Multi-product analysis', () => {
  test('3 products: detects conflicts across all pairs', () => {
    const products = [
      createProductFromOCR('레티놀 세럼', 'Water, Retinol', 'p1'),
      createProductFromOCR('AHA 토너', 'Water, Glycolic Acid', 'p2'),
      createProductFromOCR('수분 크림', 'Water, Hyaluronic Acid, Glycerin', 'p3'),
    ];

    const matches = analyzeMultipleProducts(products, rules);
    // p1(retinol) + p2(glycolic acid) = R01 conflict
    expect(matches.some((m) => m.ruleId === 'R01_retinoid_aha')).toBe(true);
    // p1 + p3, p2 + p3 = no additional conflicts expected for these combos
  });

  test('results sorted by severity (red first)', () => {
    const products = [
      createProductFromOCR('제품1', 'Water, Retinol', 'p1'),
      createProductFromOCR('제품2', 'Water, Glycolic Acid, Salicylic Acid', 'p2'),
    ];

    const matches = analyzeMultipleProducts(products, rules);
    // Should have at least R01 (retinol+AHA) and R02 (retinol+BHA), both red
    expect(matches.length).toBeGreaterThanOrEqual(2);
    // All should be red
    expect(matches[0].severity).toBe('red');
  });
});

// ════════════════════════════════════════
// 7. 한글 OCR → 분석까지 End-to-End
// ════════════════════════════════════════
describe('Korean OCR end-to-end', () => {
  test('Korean ingredient labels detected and conflict found', () => {
    const productA = createProductFromOCR(
      'A 크림',
      '정제수, 글리세린, 레티놀, 토코페롤',
      'ko-a',
    );
    const productB = createProductFromOCR(
      'B 토너',
      '정제수, 부틸렌글라이콜, 글리콜산, 히알루론산',
      'ko-b',
    );

    expect(productA.ingredients).toContain('retinol');
    expect(productB.ingredients).toContain('glycolic_acid');

    const matches = analyzeProducts(productA, productB, rules);
    expect(matches.some((m) => m.ruleId === 'R01_retinoid_aha')).toBe(true);
    expect(matches.some((m) => m.severity === 'red')).toBe(true);
  });
});

// ════════════════════════════════════════
// 8. RuleMatch 데이터 구조 검증
// ════════════════════════════════════════
describe('RuleMatch data structure', () => {
  test('RuleMatch has all required fields for ResultCard', () => {
    const productA = createProductFromOCR('A', 'Water, Retinol', 'a');
    const productB = createProductFromOCR('B', 'Water, Glycolic Acid', 'b');

    const matches = analyzeProducts(productA, productB, rules);
    const match = matches[0];

    expect(match).toBeDefined();
    expect(match.ruleId).toBeTruthy();
    expect(match.level).toBeDefined();
    expect(match.severity).toBeDefined();
    expect(match.type).toBeDefined();
    expect(match.ingredientA).toBeTruthy();
    expect(match.ingredientB).toBeTruthy();
    expect(match.productA).toBe('a');
    expect(match.productB).toBe('b');
    expect(match.rule).toBeDefined();
    expect(match.rule.title.ko).toBeTruthy();
    expect(match.rule.title.en).toBeTruthy();
    expect(match.rule.reason.ko).toBeTruthy();
    expect(match.rule.reasonDetail.ko).toBeTruthy();
    expect(match.rule.fix.ko).toBeTruthy();
    expect(match.rule.fixDetail.ko).toBeTruthy();
  });
});
