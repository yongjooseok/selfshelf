import { create } from 'zustand';
import type { Product, ProductCategory } from '../engine/types';
import { KEYS, loadJSON, saveJSON } from '../utils/storage';

interface ProductState {
  products: Product[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (data: {
    name: string;
    brand: string;
    category: ProductCategory;
    ingredients: string[];
    rawText: string;
    imageUri?: string;
  }) => Promise<Product>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loaded: false,

  load: async () => {
    const saved = await loadJSON<Product[]>(KEYS.PRODUCTS);
    set({ products: saved ?? [], loaded: true });
  },

  add: async (data) => {
    const product: Product = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      ...data,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().products, product];
    set({ products: updated });
    await saveJSON(KEYS.PRODUCTS, updated);
    return product;
  },

  remove: async (id) => {
    const updated = get().products.filter((p) => p.id !== id);
    set({ products: updated });
    await saveJSON(KEYS.PRODUCTS, updated);
  },

  getById: (id) => get().products.find((p) => p.id === id),
}));
