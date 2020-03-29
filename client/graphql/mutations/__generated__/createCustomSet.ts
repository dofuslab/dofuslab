/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, Effect } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: createCustomSet
// ====================================================

export interface createCustomSet_createCustomSet_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_stats {
  __typename: "ItemStat";
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: Effect;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: createCustomSet_createCustomSet_customSet_equippedItems_item_weaponStats_weaponEffects[];
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  eligibleItemSlots: createCustomSet_createCustomSet_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: createCustomSet_createCustomSet_customSet_equippedItems_item_set_bonuses[];
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: createCustomSet_createCustomSet_customSet_equippedItems_item_stats[];
  weaponStats: createCustomSet_createCustomSet_customSet_equippedItems_item_weaponStats | null;
  conditions: any | null;
  itemType: createCustomSet_createCustomSet_customSet_equippedItems_item_itemType;
  set: createCustomSet_createCustomSet_customSet_equippedItems_item_set | null;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface createCustomSet_createCustomSet_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: createCustomSet_createCustomSet_customSet_equippedItems_slot;
  item: createCustomSet_createCustomSet_customSet_equippedItems_item;
  exos: createCustomSet_createCustomSet_customSet_equippedItems_exos[];
}

export interface createCustomSet_createCustomSet_customSet_stats {
  __typename: "CustomSetStats";
  id: any;
  baseVitality: number;
  baseWisdom: number;
  baseStrength: number;
  baseIntelligence: number;
  baseChance: number;
  baseAgility: number;
  scrolledVitality: number;
  scrolledWisdom: number;
  scrolledStrength: number;
  scrolledIntelligence: number;
  scrolledChance: number;
  scrolledAgility: number;
}

export interface createCustomSet_createCustomSet_customSet_owner {
  __typename: "User";
  id: any;
  username: string;
}

export interface createCustomSet_createCustomSet_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: createCustomSet_createCustomSet_customSet_equippedItems[];
  stats: createCustomSet_createCustomSet_customSet_stats;
  owner: createCustomSet_createCustomSet_customSet_owner | null;
  createdAt: any | null;
  lastModified: any | null;
}

export interface createCustomSet_createCustomSet {
  __typename: "CreateCustomSet";
  customSet: createCustomSet_createCustomSet_customSet;
}

export interface createCustomSet {
  createCustomSet: createCustomSet_createCustomSet | null;
}
