/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SpellEffectType } from "./../../../__generated__/globalTypes";

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
}

export interface classById_classById_spellVariantPairs_spells {
  __typename: "Spell";
  id: any;
  name: string;
  description: string;
  imageUrl: string;
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
