/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SpellEffectType, Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: classById
// ====================================================

export interface classById_classById_spellVariantPairs_spells_spellStats_spellEffects {
  __typename: "SpellEffects";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  critMinDamage: number | null;
  critMaxDamage: number | null;
  effectType: SpellEffectType;
  condition: string | null;
}

export interface classById_classById_spellVariantPairs_spells_spellStats_spellDamageIncrease {
  __typename: "SpellDamageIncrease";
  id: any;
  baseIncrease: number;
  critBaseIncrease: number | null;
  maxStacks: number | null;
}

export interface classById_classById_spellVariantPairs_spells_spellStats_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface classById_classById_spellVariantPairs_spells_spellStats {
  __typename: "SpellStats";
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
  spellEffects: classById_classById_spellVariantPairs_spells_spellStats_spellEffects[];
  spellDamageIncrease: classById_classById_spellVariantPairs_spells_spellStats_spellDamageIncrease | null;
  buffs: classById_classById_spellVariantPairs_spells_spellStats_buffs[] | null;
}

export interface classById_classById_spellVariantPairs_spells {
  __typename: "Spell";
  id: any;
  name: string;
  description: string;
  imageUrl: string;
  isTrap: boolean;
  spellStats: classById_classById_spellVariantPairs_spells_spellStats[];
}

export interface classById_classById_spellVariantPairs {
  __typename: "SpellVariantPair";
  id: any;
  spells: classById_classById_spellVariantPairs_spells[];
}

export interface classById_classById {
  __typename: "Class";
  id: any;
  name: string;
  spellVariantPairs: classById_classById_spellVariantPairs[];
}

export interface classById {
  classById: classById_classById | null;
}

export interface classByIdVariables {
  id: any;
}
