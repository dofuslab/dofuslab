import { customSet } from 'graphql/fragments/__generated__/customSet';
import { item_set } from 'graphql/fragments/__generated__/item';
import { Stat } from '__generated__/globalTypes';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

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

export type FilterAction =
  | { type: 'SEARCH'; search: string }
  | { type: 'MAX_LEVEL'; maxLevel: number }
  | { type: 'STATS'; stats: Array<Stat> }
  | { type: 'ITEM_TYPE_IDS'; itemTypeIds: Array<CheckboxValueType> };
