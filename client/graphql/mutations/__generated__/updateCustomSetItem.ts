/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: updateCustomSetItem
// ====================================================

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_stats {
  __typename: "ItemStat";
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  eligibleItemSlots: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set_bonuses[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_stats[];
  conditions: any | null;
  itemType: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType;
  set: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot;
  item: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item;
  exos: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_exos[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_stats {
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

export interface updateCustomSetItem_updateCustomSetItem_customSet_owner {
  __typename: "User";
  id: any;
  username: string;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems[];
  stats: updateCustomSetItem_updateCustomSetItem_customSet_stats;
  owner: updateCustomSetItem_updateCustomSetItem_customSet_owner | null;
}

export interface updateCustomSetItem_updateCustomSetItem {
  __typename: "UpdateCustomSetItem";
  customSet: updateCustomSetItem_updateCustomSetItem_customSet;
}

export interface updateCustomSetItem {
  updateCustomSetItem: updateCustomSetItem_updateCustomSetItem | null;
}

export interface updateCustomSetItemVariables {
  itemSlotId: any;
  customSetId?: any | null;
  itemId?: any | null;
}
