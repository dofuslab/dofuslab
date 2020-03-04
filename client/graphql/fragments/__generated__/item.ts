/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: item
// ====================================================

export interface item_stats {
  __typename: "ItemStats";
  maxValue: number | null;
  stat: Stat | null;
}

export interface item_conditions {
  __typename: "ItemConditions";
  stat: Stat | null;
  isGreaterThan: boolean | null;
  limit: number | null;
}

export interface item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface item_itemType {
  __typename: "ItemType";
  id: any;
  eligibleItemSlots: item_itemType_eligibleItemSlots[];
}

export interface item {
  __typename: "Item";
  id: any;
  name: string;
  imageUrl: string;
  stats: item_stats[];
  conditions: item_conditions[];
  itemType: item_itemType;
}
