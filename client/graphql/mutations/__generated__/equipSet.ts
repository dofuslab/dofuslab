/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: equipSet
// ====================================================

export interface equipSet_equipSet_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
}

export interface equipSet_equipSet_customSet_equippedItems_item_stats {
  __typename: "ItemStat";
  maxValue: number | null;
  stat: Stat | null;
  customStats: string[] | null;
}

export interface equipSet_equipSet_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface equipSet_equipSet_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  eligibleItemSlots: equipSet_equipSet_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface equipSet_equipSet_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStats: (string | null)[] | null;
}

export interface equipSet_equipSet_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: equipSet_equipSet_customSet_equippedItems_item_set_bonuses[];
}

export interface equipSet_equipSet_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: equipSet_equipSet_customSet_equippedItems_item_stats[];
  conditions: any | null;
  itemType: equipSet_equipSet_customSet_equippedItems_item_itemType;
  set: equipSet_equipSet_customSet_equippedItems_item_set | null;
}

export interface equipSet_equipSet_customSet_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface equipSet_equipSet_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: equipSet_equipSet_customSet_equippedItems_slot;
  item: equipSet_equipSet_customSet_equippedItems_item;
  exos: equipSet_equipSet_customSet_equippedItems_exos[];
}

export interface equipSet_equipSet_customSet_stats {
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

export interface equipSet_equipSet_customSet_owner {
  __typename: "User";
  id: any;
  username: string;
}

export interface equipSet_equipSet_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: equipSet_equipSet_customSet_equippedItems[];
  stats: equipSet_equipSet_customSet_stats;
  owner: equipSet_equipSet_customSet_owner | null;
}

export interface equipSet_equipSet {
  __typename: "EquipSet";
  customSet: equipSet_equipSet_customSet;
}

export interface equipSet {
  equipSet: equipSet_equipSet | null;
}

export interface equipSetVariables {
  customSetId?: any | null;
  setId: any;
}
