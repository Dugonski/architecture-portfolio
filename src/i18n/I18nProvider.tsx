import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language, Localized } from '../types';
import { I18nContext } from './context';
import { translations, type TranslationKey } from './translations';

const STORAGE_KEY = 'portfolio.language';

function detectLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pt' || stored === 'en') return stored;
  } catch {
    // Storage may be unavailable (private mode); fall back to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence errors; the choice still applies to this visit.
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key: TranslationKey) => translations[lang][key],
      l: (text: Localized) => text[lang],
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
