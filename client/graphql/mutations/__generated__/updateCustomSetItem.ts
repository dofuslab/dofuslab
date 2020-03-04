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

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  imageUrl: string;
  stats: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_stats[];
  conditions: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_conditions[];
  itemType: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot | null;
  item: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  equippedItems: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems[];
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
