/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: deleteCustomSetItem
// ====================================================

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_stats {
  __typename: "ItemStats";
  maxValue: number | null;
  stat: Stat | null;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  eligibleItemSlots: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  altStat: string | null;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_set_bonuses[];
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  imageUrl: string;
  stats: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_stats[];
  conditions: any | null;
  itemType: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_itemType;
  set: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item_set | null;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_slot;
  item: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems_item;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_stats {
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

export interface deleteCustomSetItem_deleteCustomSetItem_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems[];
  stats: deleteCustomSetItem_deleteCustomSetItem_customSet_stats;
}

export interface deleteCustomSetItem_deleteCustomSetItem {
  __typename: "DeleteCustomSetItem";
  customSet: deleteCustomSetItem_deleteCustomSetItem_customSet;
}

export interface deleteCustomSetItem {
  deleteCustomSetItem: deleteCustomSetItem_deleteCustomSetItem | null;
}

export interface deleteCustomSetItemVariables {
  itemSlotId: any;
  customSetId: any;
}
