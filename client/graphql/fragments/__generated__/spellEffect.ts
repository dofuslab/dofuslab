/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type spellEffect = {
  __typename: 'SpellEffects';
  id: any;
  minDamage: number | null;
  maxDamage: number;
  critMinDamage: number | null;
  critMaxDamage: number | null;
  effectType: Types.SpellEffectType;
  condition: string | null;
};
