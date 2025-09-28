import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useThemeStore = create((set, get) => ({
  isDark: false,
  setDark: (value: boolean) => {
    AsyncStorage.setItem('isDarkTheme', JSON.stringify(value));
    set({ isDark: value });
  },
  initTheme: async () => {
    const stored = await AsyncStorage.getItem('isDarkTheme');
    if (stored !== null) {
      set({ isDark: JSON.parse(stored) });
    }
  },
}));
