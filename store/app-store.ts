"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

type AppState = {
  theme: Theme;
  locale: "en" | "hi";
  credits: number;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: "en" | "hi") => void;
  setCredits: (credits: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  locale: "en",
  credits: 25,
  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale }),
  setCredits: (credits) => set({ credits })
}));
