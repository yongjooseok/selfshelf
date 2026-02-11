import type { Ingredient } from './types';

/**
 * OCR 텍스트(또는 수동 입력 텍스트)에서 성분을 매칭합니다.
 * aliases를 순회하며 텍스트에 포함된 성분을 식별합니다.
 */
export function matchIngredients(
  text: string,
  dictionary: Ingredient[],
): string[] {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  const matchedIds: string[] = [];

  for (const ingredient of dictionary) {
    for (const alias of ingredient.aliases) {
      if (normalized.includes(alias.toLowerCase())) {
        if (!matchedIds.includes(ingredient.id)) {
          matchedIds.push(ingredient.id);
        }
        break;
      }
    }
  }

  return matchedIds;
}
