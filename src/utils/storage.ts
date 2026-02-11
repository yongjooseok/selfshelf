import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PRODUCTS: '@selfshelf/products',
  HISTORY: '@selfshelf/history',
  SETTINGS: '@selfshelf/settings',
  HAS_SEEN_ONBOARDING: '@selfshelf/hasSeenOnboarding',
} as const;

export async function loadJSON<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export { KEYS };
