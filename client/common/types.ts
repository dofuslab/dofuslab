import { customSet } from 'graphql/fragments/__generated__/customSet';
import { item_set } from 'graphql/fragments/__generated__/item';

export type StatWithCalculatedValue = {
  stat: string;
  customCalculateValue?: StatCalculator;
};

export type StatGroup = Array<StatWithCalculatedValue>;

export type StatsFromCustomSet = {
  [key: string]: number;
};

export type StatCalculator = (
  statsFromCustomSet: StatsFromCustomSet,
  customSet: customSet,
) => number;

export type SetCounter = {
  [key: string]: { count: number; set: item_set };
};
