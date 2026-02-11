import type { Product, Rule, RuleMatch } from './types';
import { LEVEL_TO_SEVERITY, LEVEL_TO_TYPE } from './types';

/**
 * 두 제품 간 성분 충돌/궁합을 분석합니다.
 *
 * 규칙의 a[], b[] 배열에 있는 성분 ID들을 교차 비교하여
 * 제품 A와 B 사이의 매칭을 찾습니다.
 */
export function analyzeProducts(
  productA: Product,
  productB: Product,
  rules: Rule[],
): RuleMatch[] {
  const matches: RuleMatch[] = [];

  for (const rule of rules) {
    // 제품 A의 성분 중 rule.a에 해당하는 것
    const aInGroupA = productA.ingredients.filter((id) => rule.a.includes(id));
    const aInGroupB = productA.ingredients.filter((id) => rule.b.includes(id));
    // 제품 B의 성분 중 rule.b에 해당하는 것
    const bInGroupA = productB.ingredients.filter((id) => rule.a.includes(id));
    const bInGroupB = productB.ingredients.filter((id) => rule.b.includes(id));

    // 교차 매칭: A에 group_a 성분 + B에 group_b 성분
    for (const ingA of aInGroupA) {
      for (const ingB of bInGroupB) {
        if (!matches.some((m) => m.ruleId === rule.id)) {
          matches.push({
            ruleId: rule.id,
            level: rule.level,
            severity: LEVEL_TO_SEVERITY[rule.level],
            type: LEVEL_TO_TYPE[rule.level],
            ingredientA: ingA,
            ingredientB: ingB,
            productA: productA.id,
            productB: productB.id,
            rule,
          });
        }
      }
    }

    // 역방향: A에 group_b 성분 + B에 group_a 성분
    for (const ingB of aInGroupB) {
      for (const ingA of bInGroupA) {
        if (!matches.some((m) => m.ruleId === rule.id)) {
          matches.push({
            ruleId: rule.id,
            level: rule.level,
            severity: LEVEL_TO_SEVERITY[rule.level],
            type: LEVEL_TO_TYPE[rule.level],
            ingredientA: ingA,
            ingredientB: ingB,
            productA: productA.id,
            productB: productB.id,
            rule,
          });
        }
      }
    }
  }

  // 정렬: 빨강(1) → 노랑(2) → 초록(3), 같은 레벨이면 weight 높은 순
  return matches.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return b.rule.severityWeight - a.rule.severityWeight;
  });
}

/**
 * 여러 제품을 조합하여 분석합니다.
 * 모든 가능한 2개 조합에 대해 분석을 실행합니다.
 */
export function analyzeMultipleProducts(
  products: Product[],
  rules: Rule[],
): RuleMatch[] {
  const allMatches: RuleMatch[] = [];

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const matches = analyzeProducts(products[i], products[j], rules);
      allMatches.push(...matches);
    }
  }

  // 중복 규칙 제거 후 정렬
  const unique = allMatches.filter(
    (match, index, arr) =>
      arr.findIndex((m) => m.ruleId === match.ruleId) === index,
  );

  return unique.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return b.rule.severityWeight - a.rule.severityWeight;
  });
}
