/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType, WeaponElementMage, BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: copyCustomSet
// ====================================================

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  enName: string;
  name: string;
  order: number;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: copyCustomSet_copyCustomSet_customSet_equippedItems_item_weaponStats_weaponEffects[];
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  enName: string;
  order: number;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: copyCustomSet_copyCustomSet_customSet_equippedItems_item_itemType_eligibleItemSlots[];
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: copyCustomSet_copyCustomSet_customSet_equippedItems_item_set_bonuses[];
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_item {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: copyCustomSet_copyCustomSet_customSet_equippedItems_item_stats[];
  weaponStats: copyCustomSet_copyCustomSet_customSet_equippedItems_item_weaponStats | null;
  conditions: any | null;
  itemType: copyCustomSet_copyCustomSet_customSet_equippedItems_item_itemType;
  set: copyCustomSet_copyCustomSet_customSet_equippedItems_item_set | null;
  buffs: copyCustomSet_copyCustomSet_customSet_equippedItems_item_buffs[] | null;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems_exos {
  __typename: "EquippedItemExo";
  id: any;
  stat: Stat;
  value: number;
}

export interface copyCustomSet_copyCustomSet_customSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: copyCustomSet_copyCustomSet_customSet_equippedItems_slot;
  item: copyCustomSet_copyCustomSet_customSet_equippedItems_item;
  exos: copyCustomSet_copyCustomSet_customSet_equippedItems_exos[];
  weaponElementMage: WeaponElementMage | null;
}

export interface copyCustomSet_copyCustomSet_customSet_stats {
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

export interface copyCustomSet_copyCustomSet_customSet_owner {
  __typename: "User";
  id: any;
  username: string;
}

export interface copyCustomSet_copyCustomSet_customSet_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  enName: string;
  femaleFaceImageUrl: string;
  maleFaceImageUrl: string;
  femaleSpriteImageUrl: string;
  maleSpriteImageUrl: string;
}

export interface copyCustomSet_copyCustomSet_customSet_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface copyCustomSet_copyCustomSet_customSet_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: copyCustomSet_copyCustomSet_customSet_tagAssociations_customSetTag;
}

export interface copyCustomSet_copyCustomSet_customSet {
  __typename: "CustomSet";
  id: any;
  name: string | null;
  level: number;
  equippedItems: copyCustomSet_copyCustomSet_customSet_equippedItems[];
  stats: copyCustomSet_copyCustomSet_customSet_stats;
  owner: copyCustomSet_copyCustomSet_customSet_owner | null;
  defaultClass: copyCustomSet_copyCustomSet_customSet_defaultClass | null;
  creationDate: any | null;
  lastModified: any | null;
  tagAssociations: copyCustomSet_copyCustomSet_customSet_tagAssociations[];
  hasEditPermission: boolean;
  buildGender: BuildGender;
  private: boolean;
}

export interface copyCustomSet_copyCustomSet {
  __typename: "CopyCustomSet";
  customSet: copyCustomSet_copyCustomSet_customSet;
}

export interface copyCustomSet {
  copyCustomSet: copyCustomSet_copyCustomSet | null;
}

export interface copyCustomSetVariables {
  customSetId: any;
}
