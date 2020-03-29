/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: item
// ====================================================

export interface item_stats {
  __typename: "ItemStat";
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  eligibleItemSlots: item_itemType_eligibleItemSlots[];
}

export interface item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: item_set_bonuses[];
}

export interface item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: item_stats[];
  conditions: any | null;
  itemType: item_itemType;
  set: item_set | null;
}
