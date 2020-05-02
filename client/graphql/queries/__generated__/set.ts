/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: set
// ====================================================

export interface set_setById_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface set_setById_items_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface set_setById_items_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface set_setById_items_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: set_setById_items_weaponStats_weaponEffects[];
}

export interface set_setById_items_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface set_setById_items_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: set_setById_items_itemType_eligibleItemSlots[];
}

export interface set_setById_items_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface set_setById_items_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: set_setById_items_set_bonuses[];
}

export interface set_setById_items {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: set_setById_items_stats[];
  weaponStats: set_setById_items_weaponStats | null;
  conditions: any | null;
  itemType: set_setById_items_itemType;
  set: set_setById_items_set | null;
}

export interface set_setById {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: set_setById_bonuses[];
  items: set_setById_items[];
}

export interface set {
  setById: set_setById;
}

export interface setVariables {
  id: any;
}
