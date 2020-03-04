/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateCustomSetItem
// ====================================================

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot_itemTypes {
  __typename: "ItemType";
  name: string;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  itemTypes: (updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot_itemTypes | null)[] | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  item: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item | null;
  slot: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  description: string | null;
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
