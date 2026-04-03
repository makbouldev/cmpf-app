import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const themes = {
  light: {
    mode: 'light',
    colors: {
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceAlt: '#f8fafc',
      surfaceMuted: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      primary: '#0066ff',
      primaryDark: '#0a2540',
      primaryText: '#ffffff',
      emergency: '#e11d48',
      emergencyLight: '#ffe4e6',
      emergencyText: '#9f1239',
      success: '#10b981',
      successLight: '#ecfdf5',
      warning: '#f59e0b',
      warningLight: '#fffbeb',
      info: '#0ea5e9',
      infoLight: '#e0f2fe',
      overlay: 'rgba(15, 23, 42, 0.45)',
      headerGradient: ['#0a2540', '#0d3261', '#0066ff'],
      cardShadow: '#0f172a',
    },
  },
  dark: {
    mode: 'dark',
    colors: {
      background: '#090d16',
      surface: '#111827',
      surfaceAlt: '#1a2234',
      surfaceMuted: '#1e293b',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: '#1f293d',
      borderLight: '#172033',
      primary: '#38bdf8',
      primaryDark: '#0284c7',
      primaryText: '#ffffff',
      emergency: '#f43f5e',
      emergencyLight: 'rgba(244, 63, 94, 0.16)',
      emergencyText: '#fda4af',
      success: '#34d399',
      successLight: 'rgba(52, 211, 153, 0.16)',
      warning: '#fbbf24',
      warningLight: 'rgba(251, 191, 36, 0.16)',
      info: '#38bdf8',
      infoLight: 'rgba(56, 189, 248, 0.16)',
      overlay: 'rgba(0, 0, 0, 0.72)',
      headerGradient: ['#090d16', '#111827', '#1e293b'],
      cardShadow: '#000000',
    },
  },
};

const ThemeContext = createContext({
  mode: 'light',
  colors: themes.light.colors,
  setMode: () => {},
});

export function ThemeProvider({ initialMode = 'light', children }) {
  const [mode, setMode] = useState(initialMode === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    setMode(initialMode === 'dark' ? 'dark' : 'light');
  }, [initialMode]);

  const value = useMemo(() => ({ ...themes[mode], setMode }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => useContext(ThemeContext);
