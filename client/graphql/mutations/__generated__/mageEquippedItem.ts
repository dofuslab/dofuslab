/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type mageEquippedItemVariables = Types.Exact<{
  stats: Array<Types.CustomSetExosInput> | Types.CustomSetExosInput;
  equippedItemId: Types.Scalars['UUID']['input'];
  weaponElementMage?: Types.InputMaybe<Types.WeaponElementMage>;
}>;

export type mageEquippedItem = {
  mageEquippedItem: {
    __typename: 'MageEquippedItem';
    equippedItem: {
      __typename: 'EquippedItem';
      id: any;
      weaponElementMage: Types.WeaponElementMage | null;
      exos: Array<{
        __typename: 'EquippedItemExo';
        id: any;
        stat: Types.Stat;
        value: number;
      }>;
    };
  } | null;
};
