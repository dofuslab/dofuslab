/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type spellStats = {
  __typename: 'SpellStats';
  id: any;
  level: number;
  apCost: number;
  castsPerTurn: number | null;
  castsPerTarget: number | null;
  cooldown: number | null;
  isLinear: boolean;
  needsLos: boolean;
  needsFreeCell: boolean;
  baseCritChance: number | null;
  minRange: number | null;
  maxRange: number | null;
  hasModifiableRange: boolean;
  spellEffects: Array<{
    __typename: 'SpellEffects';
    id: any;
    minDamage: number | null;
    maxDamage: number;
    critMinDamage: number | null;
    critMaxDamage: number | null;
    effectType: Types.SpellEffectType;
    condition: string | null;
  }>;
  spellDamageIncrease: {
    __typename: 'SpellDamageIncrease';
    id: any;
    baseIncrease: number;
    critBaseIncrease: number | null;
    maxStacks: number | null;
  } | null;
  buffs: Array<{
    __typename: 'Buff';
    id: any;
    stat: Types.Stat;
    incrementBy: number | null;
    critIncrementBy: number | null;
    maxStacks: number | null;
  }> | null;
};
