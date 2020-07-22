import NextI18Next from 'next-i18next';

const DEFAULT_LANGUAGE = 'en';
const OTHER_LANGUAGES = ['fr', 'it', 'es'];
// const OTHER_LANGUAGES = ['fr', 'de', 'pt', 'it', 'es'] as const;

export const LANGUAGES = [DEFAULT_LANGUAGE, ...OTHER_LANGUAGES] as const;
// export const LANGUAGES = [DEFAULT_LANGUAGE] as const;

export type TLanguage = typeof LANGUAGES[number];

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: DEFAULT_LANGUAGE,
  otherLanguages: OTHER_LANGUAGES,
  // otherLanguages: ['fr', 'de', 'pt', 'it', 'es'],
});

export const langToFullName = (language: TLanguage) => {
  switch (language) {
    case 'en':
      return 'English';
    case 'fr':
      return 'Français';
    case 'de':
      return 'Deutsch';
    case 'pt':
      return 'Português';
    case 'it':
      return 'Italiano';
    case 'es':
      return 'Español';
    default:
      throw new Error(`Unsupported locale ${language}`);
  }
};

const FRENCH_VOWEL_SOUNDS = [
  'a',
  'e',
  'h',
  'i',
  'o',
  'u',
  'y',
  'A',
  'E',
  'H',
  'I',
  'O',
  'U',
  'Y',
];

export const prependDe = (language: string, stringToTranslate: string) => {
  if (language !== 'fr') {
    return stringToTranslate;
  }
  if (FRENCH_VOWEL_SOUNDS.includes(stringToTranslate.charAt(0))) {
    return `d'${stringToTranslate}`;
  }

  return `de ${stringToTranslate}`;
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
