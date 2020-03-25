import { customSet } from 'graphql/fragments/__generated__/customSet';
import { item_set, item } from 'graphql/fragments/__generated__/item';
import { Stat, ItemFilters } from '__generated__/globalTypes';

export type StatWithCalculatedValue = {
  stat: string;
  customCalculateValue?: StatCalculator;
  icon?: {
    backgroundPositionX: number;
    backgroundPositionY: number;
  };
  svgIcon?: string;
};

export type StatGroup = Array<StatWithCalculatedValue>;

export type StatsFromCustomSet = {
  [key: string]: number;
};

export type StatCalculator = (
  statsFromCustomSet: StatsFromCustomSet | null,
  customSet?: customSet | null,
) => number;

export type SetCounter = {
  [key: string]: { count: number; set: item_set; items: Array<item> };
};

export type SharedFilterAction =
  | { type: 'SEARCH'; search: string }
  | { type: 'MAX_LEVEL'; maxLevel: number }
  | { type: 'STATS'; stats: Array<Stat> }
  | { type: 'RESET'; maxLevel: number };

export type MageAction =
  | { type: 'ADD'; stat: Stat }
  | { type: 'REMOVE'; stat: Stat }
  | { type: 'EDIT'; isExo: boolean; stat: Stat; value: number }
  | { type: 'RESET'; originalStatsMap: { [key: string]: { value: number } } };

export interface OriginalStatLine {
  stat: Stat | null;
  maxValue?: number | null;
  value?: number;
}

export interface ExoStatLine {
  stat: Stat;
  value: number;
}

export type SharedFilters = Omit<ItemFilters, 'itemTypeIds'>;

const mobileScreenTypesArr = [
  'HOME',
  'EQUIPPED_ITEM',
  'ITEM_SELECTOR',
  'SET_SELECTOR',
] as const;

export type MobileScreen = typeof mobileScreenTypesArr[number];

export const mobileScreenTypes = mobileScreenTypesArr.reduce(
  (acc, curr) => ({ ...acc, [curr]: curr }),
  {},
) as { [key in MobileScreen]: MobileScreen };
