/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SpellEffectType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: class
// ====================================================

export interface class_classById_spellVariantPairs_spells_spellStats_spell {
  __typename: "Spell";
  id: any;
  name: string;
  description: string;
  imageUrl: string;
}

export interface class_classById_spellVariantPairs_spells_spellStats_spellEffects {
  __typename: "SpellEffects";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  critMinDamage: number | null;
  critMaxDamage: number | null;
  effectType: SpellEffectType;
}

export interface class_classById_spellVariantPairs_spells_spellStats {
  __typename: "SpellStats";
  id: any;
  spell: class_classById_spellVariantPairs_spells_spellStats_spell | null;
  level: number;
  spellId: string;
  spellEffects: class_classById_spellVariantPairs_spells_spellStats_spellEffects[];
}

export interface class_classById_spellVariantPairs_spells {
  __typename: "Spell";
  spellStats: class_classById_spellVariantPairs_spells_spellStats[];
}

export interface class_classById_spellVariantPairs {
  __typename: "SpellVariantPair";
  id: any;
  spells: class_classById_spellVariantPairs_spells[];
}

export interface class_classById {
  __typename: "Class";
  id: any;
  name: string;
  spellVariantPairs: class_classById_spellVariantPairs[];
}

export interface class {
  classById: class_classById | null;
}

export interface classVariables {
  id: any;
}
