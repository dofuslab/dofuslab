/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType, WeaponElementMage } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: updateCustomSetItem
// ====================================================

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  name: string;
  order: number;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_weaponStats_weaponEffects[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  enName: string;
  order: number;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set_bonuses[];
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_stats[];
  weaponStats: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_weaponStats | null;
  conditions: any | null;
  itemType: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_itemType;
  set: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_set | null;
  buffs: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item_buffs[] | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_slot;
  item: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_item;
  exos: updateCustomSetItem_updateCustomSetItem_customSet_equippedItems_exos[];
  weaponElementMage: WeaponElementMage | null;
}

export interface updateCustomSetItem_updateCustomSetItem_customSet {
  __typename: "CustomSet";
  id: any;
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
  itemSlotId: any;
  customSetId?: any | null;
  itemId?: any | null;
}
