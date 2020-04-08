import sortKeys from 'sort-keys';
import fs from 'fs';
import path from 'path';
import { cloneDeep, merge } from 'lodash';

const LOCALES_PATH = 'public/static/locales';
const BASE_LOCALE = 'en';
const DEFAULT_STRING = '__STRING_NOT_TRANSLATED__';

const baseTranslations = {};

const replaceValues = obj => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      replaceValues(obj[key]);
    } else {
      obj[key] = DEFAULT_STRING;
    }
  });
};

const sortFileKeys = (localeDirPath, file, isBase) => {
  const filePath = path.join(localeDirPath, file);
  const raw = fs.readFileSync(filePath);
  const parsed = JSON.parse(raw.toString());
  const sorted = sortKeys(parsed, { deep: true });
  let result = sorted;
  if (isBase) {
    const copy = cloneDeep(sorted);
    replaceValues(copy);
    baseTranslations[file] = copy;
  } else {
    result = merge(baseTranslations[file], result);
  }
  const data = JSON.stringify(result, null, 2);
  fs.writeFileSync(filePath, data);
};

const locales = fs.readdirSync(LOCALES_PATH);
const baseLocaleDirPath = path.join(LOCALES_PATH, BASE_LOCALE);
const baseFiles = fs.readdirSync(baseLocaleDirPath);
baseFiles.forEach(file => {
  sortFileKeys(baseLocaleDirPath, file, true);
});

locales
  .filter(locale => locale !== BASE_LOCALE)
  .forEach(locale => {
    const localeDirPath = path.join(LOCALES_PATH, locale);
    const files = fs.readdirSync(localeDirPath);
    files.forEach(file => sortFileKeys(localeDirPath, file));
  });
