/**
 * E2E 데이터 플로우 검증 테스트
 *
 * Onboarding → Home → Register(OCR) → Save → Select → Analyze → Results → Save → History
 * 전체 데이터 파이프라인을 단계별로 검증합니다.
 */
import { matchIngredients } from '../matcher';
import { analyzeProducts, analyzeMultipleProducts } from '../analyzer';
import type { Ingredient, Product, Rule, AnalysisResult, RuleMatch } from '../types';
import { LEVEL_TO_SEVERITY } from '../types';
import ingredientsData from '../../../assets/data/ingredients.json';
import rulesData from '../../../assets/data/rules.json';

const ingredients = ingredientsData as Ingredient[];
const rules = rulesData as Rule[];

// ── 시뮬레이션 헬퍼 ──
let productIdCounter = 0;

function simulateRegister(
  name: string,
  rawText: string,
  category: string = 'serum',
): Product {
  const matchedIds = matchIngredients(rawText, ingredients);
  const product: Product = {
    id: `product-${++productIdCounter}`,
    name,
    brand: '',
    category: category as Product['category'],
    ingredients: matchedIds,
    rawText,
    createdAt: new Date().toISOString(),
  };
  return product;
}

function simulateAnalysis(products: Product[]): AnalysisResult {
  const matches = analyzeMultipleProducts(products, rules);
  return {
    id: `analysis-${Date.now()}`,
    productIds: products.map((p) => p.id),
    matches,
    createdAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════
// 1. 완전한 Happy Path
// ════════════════════════════════════════
describe('Complete happy path: Register → Analyze → Save', () => {
  test('2 products through full pipeline', () => {
    // Step 1: OCR → Register 제품A
    const productA = simulateRegister(
      '레티놀 세럼',
      '정제수, 글리세린, 레티놀, 토코페롤',
    );
    expect(productA.ingredients.length).toBeGreaterThan(0);
    expect(productA.ingredients).toContain('retinol');

    // Step 2: OCR → Register 제품B
    const productB = simulateRegister(
      'AHA 토너',
      'Water, Glycolic Acid, Butylene Glycol, Niacinamide',
    );
    expect(productB.ingredients).toContain('glycolic_acid');

    // Step 3: Analyze (Home → Results)
    const result = simulateAnalysis([productA, productB]);
    expect(result.productIds).toEqual([productA.id, productB.id]);
    expect(result.matches.length).toBeGreaterThan(0);

    // Step 4: Verify conflict detected
    const redMatches = result.matches.filter((m) => m.severity === 'red');
    expect(redMatches.length).toBeGreaterThan(0);
    expect(redMatches.some((m) => m.ruleId === 'R01_retinoid_aha')).toBe(true);

    // Step 5: Verify RuleMatch structure for ResultCard rendering
    const match = redMatches[0];
    expect(match.rule.title.ko).toBeTruthy();
    expect(match.rule.title.en).toBeTruthy();
    expect(match.rule.reason.ko).toBeTruthy();
    expect(match.rule.reasonDetail.ko).toBeTruthy();
    expect(match.rule.fix.ko).toBeTruthy();
    expect(match.rule.fixDetail.ko).toBeTruthy();

    // Step 6: Verify AnalysisResult structure for History
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
    expect(new Date(result.createdAt).getTime()).not.toBeNaN();
  });
});

// ════════════════════════════════════════
// 2. 안심 조합 경로
// ════════════════════════════════════════
describe('Safe combination path', () => {
  test('compatible products show no red/yellow', () => {
    const productA = simulateRegister('수분 세럼', 'Water, Hyaluronic Acid');
    const productB = simulateRegister('수분 크림', 'Water, Glycerin, Ceramide NP');

    const result = simulateAnalysis([productA, productB]);
    const dangerous = result.matches.filter(
      (m) => m.severity === 'red' || m.severity === 'yellow',
    );
    expect(dangerous.length).toBe(0);
  });
});

// ════════════════════════════════════════
// 3. 3+ 제품 분석
// ════════════════════════════════════════
describe('Multi-product analysis path', () => {
  test('3 products: finds conflicts across all pairs', () => {
    const p1 = simulateRegister('제품1', 'Water, Retinol');
    const p2 = simulateRegister('제품2', 'Water, Glycolic Acid');
    const p3 = simulateRegister('제품3', 'Water, Salicylic Acid');

    const result = simulateAnalysis([p1, p2, p3]);

    // p1+p2: R01 (retinoid+AHA)
    expect(result.matches.some((m) => m.ruleId === 'R01_retinoid_aha')).toBe(true);
    // p1+p3: R02 (retinoid+BHA)
    expect(result.matches.some((m) => m.ruleId === 'R02_retinoid_bha')).toBe(true);
  });
});

// ════════════════════════════════════════
// 4. 빈 성분 제품 경로
// ════════════════════════════════════════
describe('Empty ingredients product path', () => {
  test('product with unrecognized text has empty ingredients', () => {
    const product = simulateRegister('미확인 제품', 'xxxxzzzz nothing here');
    expect(product.ingredients).toEqual([]);
  });

  test('empty ingredients product does not crash analysis', () => {
    const emptyProduct = simulateRegister('빈 제품', '');
    const normalProduct = simulateRegister('레티놀', 'Water, Retinol');

    const result = simulateAnalysis([emptyProduct, normalProduct]);
    expect(Array.isArray(result.matches)).toBe(true);
  });
});

// ════════════════════════════════════════
// 5. 한글 OCR 전체 경로
// ════════════════════════════════════════
describe('Korean OCR full path', () => {
  test('Korean label → analysis → correct conflict', () => {
    const p1 = simulateRegister(
      '한국 세럼A',
      '정제수, 레티놀, 토코페롤',
    );
    const p2 = simulateRegister(
      '한국 토너B',
      '정제수, 글리콜산, 부틸렌글라이콜',
    );

    expect(p1.ingredients).toContain('retinol');
    expect(p2.ingredients).toContain('glycolic_acid');

    const result = simulateAnalysis([p1, p2]);
    expect(result.matches.some((m) => m.ruleId === 'R01_retinoid_aha')).toBe(true);
  });
});

// ════════════════════════════════════════
// 6. History에서 다시 보기 시나리오
// ════════════════════════════════════════
describe('History replay scenario', () => {
  test('saved result can be replayed with same products', () => {
    const p1 = simulateRegister('A', 'Water, Retinol');
    const p2 = simulateRegister('B', 'Water, Benzoyl Peroxide');

    // 첫 분석
    const firstResult = simulateAnalysis([p1, p2]);
    expect(firstResult.matches.some((m) => m.ruleId === 'R03_retinoid_benzoyl_peroxide')).toBe(true);

    // History에서 다시 분석 (같은 제품으로)
    const replayResult = simulateAnalysis([p1, p2]);
    expect(replayResult.matches.length).toBe(firstResult.matches.length);
    expect(replayResult.matches.map((m) => m.ruleId).sort()).toEqual(
      firstResult.matches.map((m) => m.ruleId).sort(),
    );
  });
});

// ════════════════════════════════════════
// 7. 프리미엄 잠금 데이터 검증
// ════════════════════════════════════════
describe('Premium lock data verification', () => {
  test('red matches have severity=red for lock check', () => {
    const p1 = simulateRegister('A', 'Retinol');
    const p2 = simulateRegister('B', 'Glycolic Acid');

    const result = simulateAnalysis([p1, p2]);
    const redMatches = result.matches.filter((m) => m.severity === 'red');

    for (const match of redMatches) {
      expect(match.level).toBe(1);
      expect(LEVEL_TO_SEVERITY[match.level]).toBe('red');
    }
  });
});

// ════════════════════════════════════════
// 8. 공유 텍스트 생성 검증
// ════════════════════════════════════════
describe('Share text generation', () => {
  test('matches have all fields needed for share text', () => {
    const p1 = simulateRegister('세럼A', 'Water, Retinol');
    const p2 = simulateRegister('토너B', 'Water, Glycolic Acid, Salicylic Acid');

    const result = simulateAnalysis([p1, p2]);

    for (const match of result.matches) {
      expect(match.severity).toBeDefined();
      expect(match.rule.title.ko).toBeTruthy();
      expect(match.rule.title.en).toBeTruthy();
      expect(['red', 'yellow', 'green']).toContain(match.severity);
    }
  });
});
