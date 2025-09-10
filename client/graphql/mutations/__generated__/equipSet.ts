/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType, WeaponElementMage, BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: equipSet
// ====================================================

export interface equipSet_equipSet_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  enName: string;
  name: string;
  order: number;
}

export interface equipSet_equipSet_customSet_equippedItems_item_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface equipSet_equipSet_customSet_equippedItems_item_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface equipSet_equipSet_customSet_equippedItems_item_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: equipSet_equipSet_customSet_equippedItems_item_weaponStats_weaponEffects[];
}

export interface equipSet_equipSet_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  enName: string;
  order: number;
}

export interface equipSet_equipSet_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: equipSet_equipSet_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface equipSet_equipSet_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface equipSet_equipSet_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: equipSet_equipSet_customSet_equippedItems_item_set_bonuses[];
}

export interface equipSet_equipSet_customSet_equippedItems_item_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface equipSet_equipSet_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: equipSet_equipSet_customSet_equippedItems_item_stats[];
  weaponStats: equipSet_equipSet_customSet_equippedItems_item_weaponStats | null;
  conditions: any | null;
  itemType: equipSet_equipSet_customSet_equippedItems_item_itemType;
  set: equipSet_equipSet_customSet_equippedItems_item_set | null;
  buffs: equipSet_equipSet_customSet_equippedItems_item_buffs[] | null;
}

export interface equipSet_equipSet_customSet_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface equipSet_equipSet_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: equipSet_equipSet_customSet_equippedItems_slot;
  item: equipSet_equipSet_customSet_equippedItems_item;
  exos: equipSet_equipSet_customSet_equippedItems_exos[];
  weaponElementMage: WeaponElementMage | null;
}

export interface equipSet_equipSet_customSet_stats {
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

export interface equipSet_equipSet_customSet_owner {
  __typename: "User";
  id: any;
  username: string;
}

export interface equipSet_equipSet_customSet_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  enName: string;
  femaleFaceImageUrl: string;
  maleFaceImageUrl: string;
  femaleSpriteImageUrl: string;
  maleSpriteImageUrl: string;
}

export interface equipSet_equipSet_customSet_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface equipSet_equipSet_customSet_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: equipSet_equipSet_customSet_tagAssociations_customSetTag;
}

export interface equipSet_equipSet_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: equipSet_equipSet_customSet_equippedItems[];
  stats: equipSet_equipSet_customSet_stats;
  owner: equipSet_equipSet_customSet_owner | null;
  defaultClass: equipSet_equipSet_customSet_defaultClass | null;
  creationDate: any | null;
  lastModified: any | null;
  tagAssociations: equipSet_equipSet_customSet_tagAssociations[];
  hasEditPermission: boolean;
  buildGender: BuildGender;
  private: boolean;
}

export interface equipSet_equipSet {
  __typename: "EquipSet";
  customSet: equipSet_equipSet_customSet;
}

export interface equipSet {
  equipSet: equipSet_equipSet | null;
}

export interface equipSetVariables {
  customSetId?: any | null;
  setId: any;
}
