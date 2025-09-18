/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type registerVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
  username: Types.Scalars['String']['input'];
  gender: Types.BuildGender;
  buildDefaultClassId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
}>;

export type register = {
  registerUser: {
    __typename: 'RegisterUser';
    user: {
      __typename: 'User';
      id: any;
      username: string;
      email: string;
      verified: boolean;
      favoriteItems: Array<{
        __typename: 'Item';
        id: any;
        name: string;
        level: number;
        imageUrl: string;
        conditions: any | null;
        stats: Array<{
          __typename: 'ItemStat';
          id: any;
          order: number;
          maxValue: number | null;
          stat: Types.Stat | null;
          customStat: string | null;
        }>;
        weaponStats: {
          __typename: 'WeaponStat';
          id: any;
          apCost: number;
          usesPerTurn: number;
          minRange: number | null;
          maxRange: number;
          baseCritChance: number | null;
          critBonusDamage: number | null;
          weaponEffects: Array<{
            __typename: 'WeaponEffect';
            id: any;
            minDamage: number | null;
            maxDamage: number;
            effectType: Types.WeaponEffectType;
          }>;
        } | null;
        itemType: {
          __typename: 'ItemType';
          id: any;
          name: string;
          enName: string;
          eligibleItemSlots: Array<{
            __typename: 'ItemSlot';
            id: any;
            enName: string;
            order: number;
          }>;
        };
        set: {
          __typename: 'Set';
          id: any;
          name: string;
          bonuses: Array<{
            __typename: 'SetBonus';
            id: any;
            numItems: number;
            stat: Types.Stat | null;
            value: number | null;
            customStat: string | null;
          }>;
        } | null;
        buffs: Array<{
          __typename: 'Buff';
          id: any;
          stat: Types.Stat;
          incrementBy: number | null;
          critIncrementBy: number | null;
          maxStacks: number | null;
        }> | null;
      }>;
      settings: {
        __typename: 'UserSetting';
        id: any;
        buildGender: Types.BuildGender;
        buildClass: {
          __typename: 'Class';
          id: any;
          maleFaceImageUrl: string;
          femaleFaceImageUrl: string;
          maleSpriteImageUrl: string;
          femaleSpriteImageUrl: string;
          name: string;
        } | null;
      };
    } | null;
  } | null;
};
