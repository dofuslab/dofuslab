/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type weaponStats = {
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
};
