import { create } from 'zustand';
import type { AnalysisResult } from '../engine/types';
import { KEYS, loadJSON, saveJSON } from '../utils/storage';

interface HistoryState {
  records: AnalysisResult[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (result: AnalysisResult) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => AnalysisResult | undefined;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  records: [],
  loaded: false,

  load: async () => {
    const saved = await loadJSON<AnalysisResult[]>(KEYS.HISTORY);
    set({ records: saved ?? [], loaded: true });
  },

  add: async (result) => {
    const updated = [result, ...get().records];
    set({ records: updated });
    await saveJSON(KEYS.HISTORY, updated);
  },

  remove: async (id) => {
    const updated = get().records.filter((r) => r.id !== id);
    set({ records: updated });
    await saveJSON(KEYS.HISTORY, updated);
  },

  getById: (id) => get().records.find((r) => r.id === id),
}));
