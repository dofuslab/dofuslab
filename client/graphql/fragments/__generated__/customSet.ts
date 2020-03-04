/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: customSet
// ====================================================

export interface customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
}

export interface customSet_equippedItems_item_stats {
  __typename: "ItemStats";
  maxValue: number | null;
  stat: Stat | null;
}

export interface customSet_equippedItems_item_conditions {
  __typename: "ItemConditions";
  stat: Stat | null;
  isGreaterThan: boolean | null;
  limit: number | null;
}

export interface customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  eligibleItemSlots: customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  imageUrl: string;
  stats: customSet_equippedItems_item_stats[];
  conditions: customSet_equippedItems_item_conditions[];
  itemType: customSet_equippedItems_item_itemType;
}

export interface customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: customSet_equippedItems_slot | null;
  item: customSet_equippedItems_item | null;
}

export interface customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  equippedItems: customSet_equippedItems[];
}
