import NextI18Next from 'next-i18next';

const DEFAULT_LANGUAGE = 'en';
const OTHER_LANGUAGES = ['fr', 'de', 'pt', 'it', 'es'] as const;

export const LANGUAGES = [DEFAULT_LANGUAGE, ...OTHER_LANGUAGES] as const;

export type TLanguage = typeof LANGUAGES[number];

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: ['fr', 'de', 'pt', 'it', 'es'],
  // otherLanguages: ['en-us'],
});

export const langToFlagCode = (language: TLanguage) => {
  switch (language) {
    case 'en':
      return 'US';
    case 'fr':
      return 'FR';
    case 'de':
      return 'DE';
    case 'pt':
      return 'PT';
    case 'it':
      return 'IT';
    case 'es':
      return 'ES';
  }
};

export default NextI18NextInstance;

/* Optionally, export class methods as named exports */
export const {
  appWithTranslation,
  withTranslation,
  useTranslation,
  Trans,
  i18n,
} = NextI18NextInstance;
