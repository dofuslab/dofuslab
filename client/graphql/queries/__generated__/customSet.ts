/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: customSet
// ====================================================

export interface customSet_customSetById_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
}

export interface customSet_customSetById_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
}

export interface customSet_customSetById_equippedItems_item_stats {
  __typename: "ItemStats";
  id: any;
  minValue: number | null;
  maxValue: number | null;
  stat: Stat | null;
}

export interface customSet_customSetById_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  imageUrl: string;
  itemType: customSet_customSetById_equippedItems_item_itemType | null;
  stats: customSet_customSetById_equippedItems_item_stats[];
}

export interface customSet_customSetById_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: customSet_customSetById_equippedItems_slot | null;
  item: customSet_customSetById_equippedItems_item | null;
}

export interface customSet_customSetById {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  equippedItems: customSet_customSetById_equippedItems[];
}

export interface customSet {
  customSetById: customSet_customSetById | null;
}

export interface customSetVariables {
  id: any;
}
