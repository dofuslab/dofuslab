import { customSet } from 'graphql/fragments/__generated__/customSet';

export type StatCalculator = (customSet: customSet) => number;

export type StatWithCalculatedValue = {
  stat: string;
  customCalculateValue?: StatCalculator;
};

export type StatGroup = Array<StatWithCalculatedValue>;
