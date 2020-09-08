/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: classBuffs
// ====================================================

export interface classBuffs_classById_spellVariantPairs_spells_spellStats_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface classBuffs_classById_spellVariantPairs_spells_spellStats {
  __typename: "SpellStats";
  id: any;
  level: number;
  buffs: classBuffs_classById_spellVariantPairs_spells_spellStats_buffs[] | null;
}

export interface classBuffs_classById_spellVariantPairs_spells {
  __typename: "Spell";
  id: any;
  name: string;
  description: string;
  imageUrl: string;
  spellStats: classBuffs_classById_spellVariantPairs_spells_spellStats[];
}

export interface classBuffs_classById_spellVariantPairs {
  __typename: "SpellVariantPair";
  id: any;
  spells: classBuffs_classById_spellVariantPairs_spells[];
}

export interface classBuffs_classById {
  __typename: "Class";
  id: any;
  name: string;
  spellVariantPairs: classBuffs_classById_spellVariantPairs[];
}

export interface classBuffs {
  classById: classBuffs_classById | null;
}

export interface classBuffsVariables {
  id: any;
}
