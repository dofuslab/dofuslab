/* tslint:disable */
/* eslint-disable */
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
  __typename: "ItemStats";
  maxValue: number | null;
  stat: Stat | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_conditions {
  __typename: "ItemConditions";
  stat: Stat | null;
  isGreaterThan: boolean | null;
  limit: number | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  eligibleItemSlots: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat;
  value: number;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  bonuses: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set_bonuses[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  imageUrl: string;
  stats: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_stats[];
  conditions: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_conditions[];
  itemType: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType;
  set: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot | null;
  item: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item | null;
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

export interface updateCustomSetItem_updateCustomSetItem_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems[];
  stats: updateCustomSetItem_updateCustomSetItem_customSet_stats;
}

export interface updateCustomSetItem_updateCustomSetItem {
  __typename: "UpdateCustomSetItem";
  customSet: updateCustomSetItem_updateCustomSetItem_customSet;
}

export interface updateCustomSetItem {
  updateCustomSetItem: updateCustomSetItem_updateCustomSetItem | null;
}

export interface updateCustomSetItemVariables {
  itemSlotId?: any | null;
  customSetId?: any | null;
  itemId?: any | null;
}
