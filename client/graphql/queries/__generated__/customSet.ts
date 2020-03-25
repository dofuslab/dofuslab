/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: customSet
// ====================================================

export interface customSet_customSetById_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
}

export interface customSet_customSetById_equippedItems_item_stats {
  __typename: "ItemStat";
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface customSet_customSetById_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface customSet_customSetById_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  eligibleItemSlots: customSet_customSetById_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface customSet_customSetById_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface customSet_customSetById_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: customSet_customSetById_equippedItems_item_set_bonuses[];
}

export interface customSet_customSetById_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: customSet_customSetById_equippedItems_item_stats[];
  conditions: any | null;
  itemType: customSet_customSetById_equippedItems_item_itemType;
  set: customSet_customSetById_equippedItems_item_set | null;
}

export interface customSet_customSetById_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface customSet_customSetById_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: customSet_customSetById_equippedItems_slot;
  item: customSet_customSetById_equippedItems_item;
  exos: customSet_customSetById_equippedItems_exos[];
}

export interface customSet_customSetById_stats {
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

export interface customSet_customSetById_owner {
  __typename: "User";
  id: any;
  username: string;
}

export interface customSet_customSetById {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: customSet_customSetById_equippedItems[];
  stats: customSet_customSetById_stats;
  owner: customSet_customSetById_owner | null;
}

export interface customSet {
  customSetById: customSet_customSetById | null;
}

export interface customSetVariables {
  id: any;
}
