import { customSet } from 'graphql/fragments/__generated__/customSet';
import { Stat } from '__generated__/globalTypes';

export type StatWithCalculatedValue = {
  stat: string;
  customCalculateValue?: StatCalculator;
};

export type StatGroup = Array<StatWithCalculatedValue>;

export type StatsFromCustomSet = {
  [x in Stat]: number;
};

export type StatCalculator = (
  statsFromCustomSet: StatsFromCustomSet,
  customSet: customSet,
) => number;
