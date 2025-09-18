/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type editCustomSetStatsVariables = Types.Exact<{
  customSetId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
  stats: Types.CustomSetStatsInput;
}>;

export type editCustomSetStats = {
  editCustomSetStats: {
    __typename: 'EditCustomSetStats';
    customSet: {
      __typename: 'CustomSet';
      id: any;
      lastModified: any | null;
      stats: {
        __typename: 'CustomSetStats';
        id: any;
        baseVitality: number;
        baseWisdom: number;
        baseStrength: number;
        baseIntelligence: number;
        baseChance: number;
        baseAgility: number;
        scrolledVitality: number;
        scrolledWisdom: number;
        scrolledStrength: number;
        scrolledIntelligence: number;
        scrolledChance: number;
        scrolledAgility: number;
      };
    };
  } | null;
};
