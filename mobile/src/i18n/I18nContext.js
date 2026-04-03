import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from './translations';

const I18nContext = createContext({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
});

export function I18nProvider({ initialLanguage = 'fr', children }) {
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    setLanguage(initialLanguage || 'fr');
  }, [initialLanguage]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => translate(language, key),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
