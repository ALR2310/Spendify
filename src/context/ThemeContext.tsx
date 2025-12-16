import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { createContext, useEffect, useMemo, useState } from 'react';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { appConfig } from '@/configs/app.config';

interface ThemeContextType {
  theme: ThemeEnum;
  resolvedTheme: ThemeEnum;
  setTheme: (theme: ThemeEnum) => void;
}

const ThemeContext = createContext<ThemeContextType>(null!);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeEnum>(appConfig.theme);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeEnum>(
    theme === ThemeEnum.SYSTEM
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? ThemeEnum.DARK
        : ThemeEnum.LIGHT
      : theme,
  );

  useEffect(() => {
    appConfig.theme = theme;

    const root = document.documentElement;
    const layout = document.getElementById('main-layout');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isNative = Capacitor.isNativePlatform();

    const applyTheme = (isDark: boolean) => {
      root.setAttribute('data-theme', isDark ? ThemeEnum.DARK : ThemeEnum.LIGHT);
      setResolvedTheme(isDark ? ThemeEnum.DARK : ThemeEnum.LIGHT);

      if (layout && isDark) {
        layout.classList.add('bg-neutral');
      } else if (layout && !isDark) {
        layout.classList.remove('bg-neutral');
      }

      if (isNative) {
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      }
    };

    if (theme === ThemeEnum.SYSTEM) {
      applyTheme(prefersDark.matches);

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      prefersDark.addEventListener('change', listener);

      return () => prefersDark.removeEventListener('change', listener);
    }

    applyTheme(theme === ThemeEnum.DARK);
  }, [theme]);

  const ctx = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
};

export { ThemeContext, ThemeProvider };
export type { ThemeContextType };
