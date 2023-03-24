export const DEFAULT_LANGUAGE = 'en';
const OTHER_LANGUAGES = ['fr', 'it', 'es', 'pt'] as const;
// const OTHER_LANGUAGES = ['fr', 'de', 'pt', 'it', 'es'] as const;

export const LANGUAGES = [DEFAULT_LANGUAGE, ...OTHER_LANGUAGES] as const;
export const ALL_LANGUAGES_INCLUDING_UNSUPPORTED = [
  ...LANGUAGES,
  'de',
] as const;
// export const LANGUAGES = [DEFAULT_LANGUAGE] as const;

export type TLanguage = typeof ALL_LANGUAGES_INCLUDING_UNSUPPORTED[number];

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
