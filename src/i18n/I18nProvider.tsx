'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale } from './config';
import en from '../messages/en.json';
import si from '../messages/si.json';
import ta from '../messages/ta.json';

const translations: Record<Locale, typeof en> = { en, si, ta };

type TranslationKey = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skilljob-locale') as Locale;
    if (saved && ['en', 'si', 'ta'].includes(saved)) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('skilljob-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const getNestedValue = (obj: Record<string, any>, path: string): string | undefined => {
    if (path in obj) return obj[path] as string;
    return path.split('.').reduce((current: any, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return current[key];
      }
      return undefined;
    }, obj) as string | undefined;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[locale], key) || getNestedValue(translations[defaultLocale], key) || key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) => result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
      value,
    );
  };

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: defaultLocale, setLocale, t }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
