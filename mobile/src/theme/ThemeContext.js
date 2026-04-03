import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const themes = {
  light: {
    mode: 'light',
    colors: {
      background: '#f3f6fb',
      surface: '#ffffff',
      surfaceAlt: '#f8fbff',
      textPrimary: '#102a43',
      textSecondary: '#486581',
      border: '#d9e4f2',
      primary: '#0d6efd',
      primaryText: '#ffffff',
      overlay: 'rgba(16,42,67,0.18)',
      headerGradient: ['#0f6dff', '#0d6efd', '#22b8cf'],
    },
  },
  dark: {
    mode: 'dark',
    colors: {
      background: '#0f172a',
      surface: '#111b31',
      surfaceAlt: '#17233f',
      textPrimary: '#e5edff',
      textSecondary: '#b4c3e3',
      border: '#26385f',
      primary: '#3b82f6',
      primaryText: '#ffffff',
      overlay: 'rgba(2,6,23,0.52)',
      headerGradient: ['#1e293b', '#1d4ed8', '#0f766e'],
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
