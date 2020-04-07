import NextI18Next from 'next-i18next';
import moment from 'moment';

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: ['fr', 'de', 'pt', 'it', 'es'],
  interpolation: {
    format: (value, format) => {
      if (value instanceof Date) {
        return moment(value).format(format || 'll');
      }
      return value;
    },
  },
});

export default NextI18NextInstance;

/* Optionally, export class methods as named exports */
export const {
  appWithTranslation,
  withTranslation,
  useTranslation,
  Trans,
} = NextI18NextInstance;
