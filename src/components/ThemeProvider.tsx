'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  THEME_COOKIE_MAX_AGE,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/theme';

export type { ThemeMode };

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readDomTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function persistTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${THEME_STORAGE_KEY}=${mode};path=/;max-age=${THEME_COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', mode === 'dark' ? '#1C1A18' : '#F5F0E8');
  }
  persistTheme(mode);
}

export function ThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: ReactNode;
  /** From cookie — keeps SSR html class in sync */
  initialTheme?: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);

  // Before paint: sync storage ↔ DOM (covers localStorage-only first visit)
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const next: ThemeMode =
        stored === 'dark' || stored === 'light' ? stored : readDomTheme();
      setThemeState(next);
      applyTheme(next);
    } catch {
      applyTheme(readDomTheme());
    }
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'light' as ThemeMode,
      setTheme: (_: ThemeMode) => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}

/** @deprecated import from `@/lib/theme` */
export { THEME_BOOT_SCRIPT } from '@/lib/theme';
