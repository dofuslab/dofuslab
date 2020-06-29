/* eslint-disable import/no-extraneous-dependencies */
import sortKeys from 'sort-keys';
import fs from 'fs';
import path from 'path';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

const LOCALES_PATH = 'public/static/locales';
const BASE_LOCALE = 'en';
const DEFAULT_STRING = '__STRING_NOT_TRANSLATED__';

const baseTranslations = {};

const replaceValues = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      replaceValues(obj[key]);
    } else {
      // eslint-disable-next-line
      obj[key] = DEFAULT_STRING;
    }
  });
};

const sortFileKeys = (localeDirPath, file, isBase) => {
  const filePath = path.join(localeDirPath, file);
  const raw = fs.readFileSync(filePath);
  let parsed = JSON.parse(raw.toString());
  if (isBase) {
    const copy = cloneDeep(parsed);
    replaceValues(copy);
    baseTranslations[file] = copy;
  } else {
    parsed = merge({}, baseTranslations[file], parsed);
  }
  const sorted = sortKeys(parsed, { deep: true });
  const data = `${JSON.stringify(sorted, null, 2)}\n`;
  fs.writeFileSync(filePath, data);
};

const locales = fs.readdirSync(LOCALES_PATH);
const baseLocaleDirPath = path.join(LOCALES_PATH, BASE_LOCALE);
const baseFiles = fs.readdirSync(baseLocaleDirPath);
baseFiles.forEach((file) => {
  sortFileKeys(baseLocaleDirPath, file, true);
});

locales
  .filter((locale) => locale !== BASE_LOCALE)
  .forEach((locale) => {
    const localeDirPath = path.join(LOCALES_PATH, locale);
    const files = fs.readdirSync(localeDirPath);
    files.forEach((file) => sortFileKeys(localeDirPath, file));
  });
