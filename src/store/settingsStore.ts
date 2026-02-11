import { create } from 'zustand';
import i18n from '../i18n';
import { KEYS, loadJSON, saveJSON } from '../utils/storage';

interface SettingsData {
  isPremium: boolean;
  language: 'ko' | 'en';
  hasSeenOnboarding: boolean;
}

interface SettingsState extends SettingsData {
  loaded: boolean;
  load: () => Promise<void>;
  setPremium: (value: boolean) => Promise<void>;
  setLanguage: (lang: 'ko' | 'en') => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
}

const DEFAULT_SETTINGS: SettingsData = {
  isPremium: false,
  language: 'ko',
  hasSeenOnboarding: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const saved = await loadJSON<SettingsData>(KEYS.SETTINGS);
    const data = { ...DEFAULT_SETTINGS, ...saved };
    i18n.changeLanguage(data.language);
    set({ ...data, loaded: true });
  },

  setPremium: async (value) => {
    set({ isPremium: value });
    const { isPremium, language, hasSeenOnboarding } = { ...get(), isPremium: value };
    await saveJSON(KEYS.SETTINGS, { isPremium, language, hasSeenOnboarding });
  },

  setLanguage: async (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
    const { isPremium, language, hasSeenOnboarding } = { ...get(), language: lang };
    await saveJSON(KEYS.SETTINGS, { isPremium, language, hasSeenOnboarding });
  },

  setHasSeenOnboarding: async (value) => {
    set({ hasSeenOnboarding: value });
    const { isPremium, language, hasSeenOnboarding } = {
      ...get(),
      hasSeenOnboarding: value,
    };
    await saveJSON(KEYS.SETTINGS, { isPremium, language, hasSeenOnboarding });
  },
}));
