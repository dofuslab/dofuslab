import _ from 'lodash';

import { NormalStatLine } from './types';

export const modifiedStartCase: (input: string) => string = input => {
  return _.startCase(input)
    .split(' ')
    .map((word: string) => {
      let result = word;
      if (word === 'Ap' || word === 'Mp') result = word.toUpperCase();
      else if (word === 'Pct') result = '%';
      return result;
    })
    .join(' ');
};

export const formatStat: (statLine: NormalStatLine) => string = statLine => {
  if (statLine.stat.startsWith('pct')) {
    return `${statLine.value}% ${modifiedStartCase(
      statLine.stat.substring(3)
    )}`;
  }
  return `${statLine.value} ${modifiedStartCase(statLine.stat)}`;
};
