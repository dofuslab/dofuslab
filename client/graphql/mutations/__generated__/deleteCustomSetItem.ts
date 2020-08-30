/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteCustomSetItem
// ====================================================

export interface deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems {
  __typename: 'EquippedItem';
  id: any;
}

export interface deleteCustomSetItem_deleteCustomSetItem_customSet {
  __typename: 'CustomSet';
  id: any;
  lastModified: any | null;
  equippedItems: deleteCustomSetItem_deleteCustomSetItem_customSet_equippedItems[];
}

export interface deleteCustomSetItem_deleteCustomSetItem {
  __typename: 'DeleteCustomSetItem';
  customSet: deleteCustomSetItem_deleteCustomSetItem_customSet;
}

export interface deleteCustomSetItem {
  deleteCustomSetItem: deleteCustomSetItem_deleteCustomSetItem | null;
}

export interface deleteCustomSetItemVariables {
  itemSlotId: any;
  customSetId: any;
}
