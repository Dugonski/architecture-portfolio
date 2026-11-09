import { createContext, useContext } from 'react';
import type { Language, Localized } from '../types';
import type { TranslationKey } from './translations';

export interface I18nValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translates an interface string. */
  t: (key: TranslationKey) => string;
  /** Picks the current language from a localized content value. */
  l: (text: Localized) => string;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}
