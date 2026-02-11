// === 성분 사전 (ingredients.json) ===
export interface Ingredient {
  id: string;
  inciName: string;
  koName: string;
  aliases: string[];
  class: string[];
  isActive: boolean;
  description: {
    en: string;
    ko: string;
  };
}

// === 규칙 (rules.json) ===
export type RuleLevel = 1 | 2 | 3;
export type RuleType = 'mutual' | 'ordered';

export interface Rule {
  id: string;
  level: RuleLevel;
  type: RuleType;
  a: string[];
  b: string[];
  title: { en: string; ko: string };
  reason: { en: string; ko: string };
  reasonDetail: { en: string; ko: string };
  fix: { en: string; ko: string };
  fixDetail: { en: string; ko: string };
  severityWeight: number;
}

// level → severity 매핑
export type Severity = 'red' | 'yellow' | 'green';

export const LEVEL_TO_SEVERITY: Record<RuleLevel, Severity> = {
  1: 'red',
  2: 'yellow',
  3: 'green',
};

export const LEVEL_TO_TYPE: Record<RuleLevel, string> = {
  1: 'conflict',
  2: 'caution',
  3: 'synergy',
};

// === 제품 (로컬 저장) ===
export const PRODUCT_CATEGORIES = [
  'toner',
  'serum',
  'cream',
  'cleanser',
  'sunscreen',
  'mask',
  'other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  ingredients: string[]; // 매칭된 성분 ID 배열
  rawText: string;
  createdAt: string;
  imageUri?: string;
}

// === 분석 결과 ===
export interface RuleMatch {
  ruleId: string;
  level: RuleLevel;
  severity: Severity;
  type: string; // 'conflict' | 'caution' | 'synergy'
  ingredientA: string;
  ingredientB: string;
  productA: string;
  productB: string;
  rule: Rule;
}

export interface AnalysisResult {
  id: string;
  productIds: string[];
  matches: RuleMatch[];
  createdAt: string;
}
