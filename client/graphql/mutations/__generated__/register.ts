/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BuildGender, Stat, WeaponEffectType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: register
// ====================================================

export interface register_registerUser_user_favoriteItems_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface register_registerUser_user_favoriteItems_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface register_registerUser_user_favoriteItems_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: register_registerUser_user_favoriteItems_weaponStats_weaponEffects[];
}

export interface register_registerUser_user_favoriteItems_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  enName: string;
  order: number;
}

export interface register_registerUser_user_favoriteItems_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: register_registerUser_user_favoriteItems_itemType_eligibleItemSlots[];
}

export interface register_registerUser_user_favoriteItems_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface register_registerUser_user_favoriteItems_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: register_registerUser_user_favoriteItems_set_bonuses[];
}

export interface register_registerUser_user_favoriteItems_buffs {
  __typename: "Buff";
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface register_registerUser_user_favoriteItems {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: register_registerUser_user_favoriteItems_stats[];
  weaponStats: register_registerUser_user_favoriteItems_weaponStats | null;
  conditions: any | null;
  itemType: register_registerUser_user_favoriteItems_itemType;
  set: register_registerUser_user_favoriteItems_set | null;
  buffs: register_registerUser_user_favoriteItems_buffs[] | null;
}

export interface register_registerUser_user_settings_buildClass {
  __typename: "Class";
  id: any;
  maleFaceImageUrl: string;
  femaleFaceImageUrl: string;
  maleSpriteImageUrl: string;
  femaleSpriteImageUrl: string;
  name: string;
}

export interface register_registerUser_user_settings {
  __typename: "UserSetting";
  id: any;
  buildGender: BuildGender;
  buildClass: register_registerUser_user_settings_buildClass | null;
}

export interface register_registerUser_user {
  __typename: "User";
  id: any;
  favoriteItems: register_registerUser_user_favoriteItems[];
  username: string;
  email: string;
  verified: boolean;
  settings: register_registerUser_user_settings;
}

export interface register_registerUser {
  __typename: "RegisterUser";
  user: register_registerUser_user | null;
}

export interface register {
  registerUser: register_registerUser | null;
}

export interface registerVariables {
  email: string;
  password: string;
  username: string;
  gender: BuildGender;
  buildDefaultClassId?: any | null;
}
