/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from './../../../__generated__/globalTypes';

// ====================================================
// GraphQL query operation: allBuffs
// ====================================================

export interface allBuffs_allBuffs_item {
  __typename: 'Item';
  id: any;
  name: string;
  imageUrl: string;
}

export interface allBuffs_allBuffs_spellStats_spell_variantPair_class {
  __typename: 'Class';
  id: any;
  name: string;
}

export interface allBuffs_allBuffs_spellStats_spell_variantPair {
  __typename: 'SpellVariantPair';
  id: any;
  class: allBuffs_allBuffs_spellStats_spell_variantPair_class | null;
}

export interface allBuffs_allBuffs_spellStats_spell {
  __typename: 'Spell';
  id: any;
  name: string;
  imageUrl: string;
  variantPair: allBuffs_allBuffs_spellStats_spell_variantPair | null;
}

export interface allBuffs_allBuffs_spellStats {
  __typename: 'SpellStats';
  id: any;
  level: number;
  spell: allBuffs_allBuffs_spellStats_spell | null;
}

export interface allBuffs_allBuffs {
  __typename: 'Buff';
  id: any;
  item: allBuffs_allBuffs_item | null;
  spellStats: allBuffs_allBuffs_spellStats | null;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface allBuffs {
  allBuffs: allBuffs_allBuffs[];
}
