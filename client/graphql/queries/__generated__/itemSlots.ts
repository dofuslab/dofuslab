/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: itemSlots
// ====================================================

export interface itemSlots_itemSlots_itemTypes {
  __typename: 'ItemType';
  id: any;
  name: string;
}

export interface itemSlots_itemSlots {
  __typename: 'ItemSlot';
  id: any;
  enName: string;
  name: string;
  order: number;
  itemTypes: itemSlots_itemSlots_itemTypes[];
  imageUrl: string;
}

export interface itemSlots {
  itemSlots: itemSlots_itemSlots[];
}
