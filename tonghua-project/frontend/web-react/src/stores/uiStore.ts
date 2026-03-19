import { create } from 'zustand';
import type { Locale } from '@/types';

interface UIState {
  mobileNavOpen: boolean;
  currentLocale: Locale;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setLocale: (locale: Locale) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  currentLocale: 'en',

  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  toggleMobileNav: () =>
    set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  setLocale: (currentLocale) => set({ currentLocale }),
}));
