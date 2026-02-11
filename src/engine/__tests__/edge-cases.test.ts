/**
 * 엣지 케이스 테스트
 *
 * 빈 성분, 동일 제품, 단일 제품, 비매칭 등 경계 조건을 검증합니다.
 */
import { matchIngredients } from '../matcher';
import { analyzeProducts, analyzeMultipleProducts } from '../analyzer';
import type { Ingredient, Product, Rule } from '../types';
import ingredientsData from '../../../assets/data/ingredients.json';
import rulesData from '../../../assets/data/rules.json';

const ingredients = ingredientsData as Ingredient[];
const rules = rulesData as Rule[];

function makeProduct(
  id: string,
  ingredientIds: string[],
  name = 'Test',
): Product {
  return {
    id,
    name,
    brand: '',
    category: 'serum',
    ingredients: ingredientIds,
    rawText: '',
    createdAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════
// 1. 빈 성분 제품
// ════════════════════════════════════════
describe('Empty ingredients', () => {
  test('product with no ingredients returns no matches', () => {
    const a = makeProduct('a', []);
    const b = makeProduct('b', ['retinol', 'glycolic_acid']);
    const matches = analyzeProducts(a, b, rules);
    expect(matches).toEqual([]);
  });

  test('both products with no ingredients returns no matches', () => {
    const a = makeProduct('a', []);
    const b = makeProduct('b', []);
    const matches = analyzeProducts(a, b, rules);
    expect(matches).toEqual([]);
  });
});

// ════════════════════════════════════════
// 2. 동일 제품 분석
// ════════════════════════════════════════
describe('Same product analysis', () => {
  test('same product analyzed with itself (same ID)', () => {
    const product = makeProduct('same', ['retinol', 'glycolic_acid']);
    // 같은 제품끼리 분석 시 교차 매칭이 발생함 (동일 제품 내에서도 규칙은 적용됨)
    const matches = analyzeProducts(product, product, rules);
    // retinol + glycolic_acid는 R01_retinoid_aha 규칙에 해당
    expect(matches.some((m) => m.ruleId === 'R01_retinoid_aha')).toBe(true);
  });

  test('duplicate IDs in multipleProducts are handled', () => {
    const product = makeProduct('dup', ['retinol']);
    // 같은 제품 2개 → 쌍은 1개
    const matches = analyzeMultipleProducts([product, product], rules);
    // retinol이 a[]와 b[] 양쪽에 있는 규칙(C05_multi_actives)이 매칭될 수 있음
    // 최소한 크래시 없이 결과가 나와야 함
    expect(Array.isArray(matches)).toBe(true);
  });
});

// ════════════════════════════════════════
// 3. 단일 제품 분석 시도
// ════════════════════════════════════════
describe('Single product in multipleProducts', () => {
  test('single product returns no matches', () => {
    const product = makeProduct('solo', ['retinol', 'glycolic_acid']);
    const matches = analyzeMultipleProducts([product], rules);
    expect(matches).toEqual([]);
  });

  test('empty array returns no matches', () => {
    const matches = analyzeMultipleProducts([], rules);
    expect(matches).toEqual([]);
  });
});

// ════════════════════════════════════════
// 4. 규칙과 무관한 성분 조합
// ════════════════════════════════════════
describe('No matching rules', () => {
  test('ingredients not in any rule produce no matches', () => {
    const a = makeProduct('a', ['water', 'glycerin']);
    const b = makeProduct('b', ['butylene_glycol', 'tocopherol']);
    const matches = analyzeProducts(a, b, rules);
    // 이 조합에 대한 red/yellow 규칙 없음
    const redYellow = matches.filter(
      (m) => m.severity === 'red' || m.severity === 'yellow',
    );
    expect(redYellow.length).toBe(0);
  });
});

// ════════════════════════════════════════
// 5. matcher 엣지 케이스
// ════════════════════════════════════════
describe('Matcher edge cases', () => {
  test('very long text still matches', () => {
    const padding = 'Lorem ipsum dolor sit amet '.repeat(100);
    const text = padding + 'retinol' + padding;
    const ids = matchIngredients(text, ingredients);
    expect(ids).toContain('retinol');
  });

  test('special characters in text do not crash', () => {
    const text = 'retinol!@#$%^&*() niacinamide<>?/\\';
    const ids = matchIngredients(text, ingredients);
    expect(ids).toContain('retinol');
    expect(ids).toContain('niacinamide');
  });

  test('numeric-only text returns empty', () => {
    const ids = matchIngredients('12345 67890', ingredients);
    expect(ids).toEqual([]);
  });
});

// ════════════════════════════════════════
// 6. 다수의 제품 (N=5)
// ════════════════════════════════════════
describe('Many products', () => {
  test('5 products: all pairs checked', () => {
    const products = [
      makeProduct('p1', ['retinol']),
      makeProduct('p2', ['glycolic_acid']),
      makeProduct('p3', ['salicylic_acid']),
      makeProduct('p4', ['benzoyl_peroxide']),
      makeProduct('p5', ['niacinamide', 'hyaluronic_acid']),
    ];
    const matches = analyzeMultipleProducts(products, rules);
    // p1+p2: R01, p1+p3: R02, p1+p4: R03 최소 3개 red
    expect(matches.filter((m) => m.severity === 'red').length).toBeGreaterThanOrEqual(3);
  });
});

// ════════════════════════════════════════
// 7. RuleMatch 정렬 검증
// ════════════════════════════════════════
describe('Result sorting', () => {
  test('red comes before yellow, yellow before green', () => {
    const products = [
      makeProduct('p1', ['retinol', 'niacinamide']),
      makeProduct('p2', ['glycolic_acid', 'hyaluronic_acid']),
    ];
    const matches = analyzeMultipleProducts(products, rules);
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].level).toBeLessThanOrEqual(matches[i + 1].level);
    }
  });
});
