import { matchIngredients } from '../matcher';
import type { Ingredient } from '../types';
import ingredientsData from '../../../assets/data/ingredients.json';

const ingredients = ingredientsData as Ingredient[];

// ─── 헬퍼 ───
function match(text: string) {
  return matchIngredients(text, ingredients);
}

// ════════════════════════════════════════
// 1. 기본 영문 INCI 매칭
// ════════════════════════════════════════
describe('Basic English INCI matching', () => {
  test('matches single ingredient by INCI name', () => {
    const ids = match('retinol');
    expect(ids).toContain('retinol');
  });

  test('matches niacinamide', () => {
    const ids = match('niacinamide');
    expect(ids).toContain('niacinamide');
  });

  test('matches hyaluronic acid', () => {
    const ids = match('hyaluronic acid');
    expect(ids).toContain('hyaluronic_acid');
  });

  test('matches salicylic acid', () => {
    const ids = match('salicylic acid');
    expect(ids).toContain('salicylic_acid');
  });

  test('matches benzoyl peroxide', () => {
    const ids = match('benzoyl peroxide');
    expect(ids).toContain('benzoyl_peroxide');
  });
});

// ════════════════════════════════════════
// 2. 한글 매칭
// ════════════════════════════════════════
describe('Korean alias matching', () => {
  test('matches 레티놀', () => {
    const ids = match('레티놀');
    expect(ids).toContain('retinol');
  });

  test('matches 나이아신아마이드', () => {
    const ids = match('나이아신아마이드');
    expect(ids).toContain('niacinamide');
  });

  test('matches 히알루론산', () => {
    const ids = match('히알루론산');
    expect(ids).toContain('hyaluronic_acid');
  });

  test('matches 살리실산', () => {
    const ids = match('살리실산');
    expect(ids).toContain('salicylic_acid');
  });

  test('matches 비타민c', () => {
    const ids = match('비타민c');
    expect(ids).toContain('l_ascorbic_acid');
  });

  test('matches 글리세린', () => {
    const ids = match('글리세린');
    expect(ids).toContain('glycerin');
  });
});

// ════════════════════════════════════════
// 3. 대소문자 무관 매칭
// ════════════════════════════════════════
describe('Case insensitivity', () => {
  test('matches RETINOL (uppercase)', () => {
    const ids = match('RETINOL');
    expect(ids).toContain('retinol');
  });

  test('matches Niacinamide (mixed case)', () => {
    const ids = match('Niacinamide');
    expect(ids).toContain('niacinamide');
  });

  test('matches GLYCOLIC ACID', () => {
    const ids = match('GLYCOLIC ACID');
    expect(ids).toContain('glycolic_acid');
  });

  test('matches Vitamin C (mixed case)', () => {
    const ids = match('Vitamin C');
    expect(ids).toContain('l_ascorbic_acid');
  });
});

// ════════════════════════════════════════
// 4. 복수 성분 동시 매칭
// ════════════════════════════════════════
describe('Multiple ingredient matching', () => {
  test('matches multiple comma-separated ingredients', () => {
    const ids = match('Water, Glycerin, Niacinamide, Retinol');
    expect(ids).toContain('water');
    expect(ids).toContain('glycerin');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('retinol');
    expect(ids.length).toBeGreaterThanOrEqual(4);
  });

  test('matches Korean + English mixed text', () => {
    const ids = match('정제수, Glycerin, 나이아신아마이드, Retinol');
    expect(ids).toContain('water');
    expect(ids).toContain('glycerin');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('retinol');
  });

  test('matches real-world ingredient list', () => {
    const text =
      'Water, Butylene Glycol, Glycerin, Niacinamide, Sodium Hyaluronate, Tocopherol';
    const ids = match(text);
    expect(ids).toContain('water');
    expect(ids).toContain('butylene_glycol');
    expect(ids).toContain('glycerin');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('hyaluronic_acid'); // sodium hyaluronate alias
    expect(ids).toContain('tocopherol');
  });
});

// ════════════════════════════════════════
// 5. OCR 특유의 지저분한 텍스트
// ════════════════════════════════════════
describe('OCR-like messy text', () => {
  test('matches with extra whitespace', () => {
    const ids = match('  retinol   niacinamide   ');
    expect(ids).toContain('retinol');
    expect(ids).toContain('niacinamide');
  });

  test('matches with newlines (OCR line breaks)', () => {
    const text = 'Water\nGlycerin\nNiacinamide\nRetinol';
    const ids = match(text);
    expect(ids).toContain('water');
    expect(ids).toContain('glycerin');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('retinol');
  });

  test('matches with tabs and mixed whitespace', () => {
    const ids = match('retinol\t\tniacinamide \n glycolic acid');
    expect(ids).toContain('retinol');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('glycolic_acid');
  });
});

// ════════════════════════════════════════
// 6. 별칭(alias) 매칭
// ════════════════════════════════════════
describe('Alias matching', () => {
  test('matches vitamin a → retinol', () => {
    const ids = match('vitamin a');
    expect(ids).toContain('retinol');
  });

  test('matches vitamin b3 → niacinamide', () => {
    const ids = match('vitamin b3');
    expect(ids).toContain('niacinamide');
  });

  test('matches vitamin e → tocopherol', () => {
    const ids = match('vitamin e');
    expect(ids).toContain('tocopherol');
  });

  test('matches sodium hyaluronate → hyaluronic_acid', () => {
    const ids = match('sodium hyaluronate');
    expect(ids).toContain('hyaluronic_acid');
  });

  test('matches BHA → salicylic_acid', () => {
    const ids = match('BHA');
    expect(ids).toContain('salicylic_acid');
  });

  test('matches aqua → water', () => {
    const ids = match('aqua');
    expect(ids).toContain('water');
  });

  test('matches 순수비타민c → l_ascorbic_acid', () => {
    const ids = match('순수비타민c');
    expect(ids).toContain('l_ascorbic_acid');
  });
});

// ════════════════════════════════════════
// 7. 빈 입력 / 엣지 케이스
// ════════════════════════════════════════
describe('Edge cases', () => {
  test('returns empty array for empty string', () => {
    expect(match('')).toEqual([]);
  });

  test('returns empty array for whitespace only', () => {
    expect(match('   ')).toEqual([]);
  });

  test('returns empty array for unrecognized text', () => {
    expect(match('xxxxzzzz nothing here')).toEqual([]);
  });

  test('does not duplicate IDs', () => {
    // retinol appears in text twice
    const ids = match('retinol 레티놀 retinol');
    const retinolCount = ids.filter((id) => id === 'retinol').length;
    expect(retinolCount).toBe(1);
  });
});

// ════════════════════════════════════════
// 8. 유사 성분 구분 (오탐 방지)
// ════════════════════════════════════════
describe('Similar ingredient distinction', () => {
  test('retinol and tretinoin are separate', () => {
    const ids = match('retinol, tretinoin');
    expect(ids).toContain('retinol');
    expect(ids).toContain('tretinoin');
    expect(ids.filter((id) => id === 'retinol').length).toBe(1);
    expect(ids.filter((id) => id === 'tretinoin').length).toBe(1);
  });

  test('glycolic acid and lactic acid are separate', () => {
    const ids = match('glycolic acid, lactic acid');
    expect(ids).toContain('glycolic_acid');
    expect(ids).toContain('lactic_acid');
  });

  test('ascorbic acid vs ethyl ascorbic acid', () => {
    // 'ascorbic acid' alone should match l_ascorbic_acid
    const ids1 = match('ascorbic acid');
    expect(ids1).toContain('l_ascorbic_acid');

    // 'ethyl ascorbic acid' should match ethyl variant
    const ids2 = match('ethyl ascorbic acid');
    expect(ids2).toContain('ethyl_ascorbic_acid');
  });
});

// ════════════════════════════════════════
// 9. 실제 성분표 시뮬레이션
// ════════════════════════════════════════
describe('Real ingredient label simulation', () => {
  test('Korean cosmetic label', () => {
    const text = '정제수, 글리세린, 부틸렌글라이콜, 나이아신아마이드, 히알루론산, 토코페롤';
    const ids = match(text);
    expect(ids).toContain('water');
    expect(ids).toContain('glycerin');
    expect(ids).toContain('butylene_glycol');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('hyaluronic_acid');
    expect(ids).toContain('tocopherol');
    expect(ids.length).toBeGreaterThanOrEqual(6);
  });

  test('English cosmetic label with conflict pair (retinol + glycolic acid)', () => {
    const text =
      'Water, Glycerin, Retinol, Butylene Glycol, Glycolic Acid, Tocopherol';
    const ids = match(text);
    expect(ids).toContain('retinol');
    expect(ids).toContain('glycolic_acid');
    // These two are a red-level conflict (R01_retinoid_aha)
  });

  test('mixed-language OCR output', () => {
    const text = `정제수 Water
Glycerin 글리세린
Niacinamide  나이아신아마이드
Retinol
살리실산 Salicylic Acid`;
    const ids = match(text);
    expect(ids).toContain('water');
    expect(ids).toContain('glycerin');
    expect(ids).toContain('niacinamide');
    expect(ids).toContain('retinol');
    expect(ids).toContain('salicylic_acid');
  });
});
