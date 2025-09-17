/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type setEquippedItemExoVariables = Types.Exact<{
  stat: Types.Stat;
  equippedItemId: Types.Scalars['UUID']['input'];
  hasStat: Types.Scalars['Boolean']['input'];
}>;

export type setEquippedItemExo = {
  setEquippedItemExo: {
    __typename: 'SetEquippedItemExo';
    equippedItem: {
      __typename: 'EquippedItem';
      id: any;
      exos: Array<{
        __typename: 'EquippedItemExo';
        id: any;
        stat: Types.Stat;
        value: number;
      }>;
    };
  } | null;
};
