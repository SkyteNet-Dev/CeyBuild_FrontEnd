export type Locale = 'en' | 'si' | 'ta';

export const locales: Locale[] = ['en', 'si', 'ta'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
};

export const defaultLocale: Locale = 'en';
