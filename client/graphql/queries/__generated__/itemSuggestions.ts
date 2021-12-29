/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: itemSuggestions
// ====================================================

export interface itemSuggestions_itemSuggestions_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface itemSuggestions_itemSuggestions_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface itemSuggestions_itemSuggestions_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: itemSuggestions_itemSuggestions_weaponStats_weaponEffects[];
}

export interface itemSuggestions_itemSuggestions_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface itemSuggestions_itemSuggestions_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: itemSuggestions_itemSuggestions_itemType_eligibleItemSlots[];
}

export interface itemSuggestions_itemSuggestions_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface itemSuggestions_itemSuggestions_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: itemSuggestions_itemSuggestions_set_bonuses[];
}

export interface itemSuggestions_itemSuggestions_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface itemSuggestions_itemSuggestions {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: itemSuggestions_itemSuggestions_stats[];
  weaponStats: itemSuggestions_itemSuggestions_weaponStats | null;
  conditions: any | null;
  itemType: itemSuggestions_itemSuggestions_itemType;
  set: itemSuggestions_itemSuggestions_set | null;
  buffs: itemSuggestions_itemSuggestions_buffs[] | null;
}

export interface itemSuggestions {
  itemSuggestions: itemSuggestions_itemSuggestions[];
}

export interface itemSuggestionsVariables {
  customSetId: any;
  itemSlotId?: any | null;
}
