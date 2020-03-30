/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectTypes } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: item
// ====================================================

export interface item_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface item_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectTypes;
}

export interface item_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: item_weaponStats_weaponEffects[];
}

export interface item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  eligibleItemSlots: item_itemType_eligibleItemSlots[];
}

export interface item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: item_set_bonuses[];
}

export interface item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: item_stats[];
  weaponStats: item_weaponStats | null;
  conditions: any | null;
  itemType: item_itemType;
  set: item_set | null;
}
