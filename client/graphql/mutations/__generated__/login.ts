/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType } from './../../../__generated__/globalTypes';

// ====================================================
// GraphQL mutation operation: login
// ====================================================

export interface login_loginUser_user_favoriteItems_stats {
  __typename: 'ItemStat';
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface login_loginUser_user_favoriteItems_weaponStats_weaponEffects {
  __typename: 'WeaponEffect';
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface login_loginUser_user_favoriteItems_weaponStats {
  __typename: 'WeaponStat';
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: login_loginUser_user_favoriteItems_weaponStats_weaponEffects[];
}

export interface login_loginUser_user_favoriteItems_itemType_eligibleItemSlots {
  __typename: 'ItemSlot';
  id: any;
  order: number;
}

export interface login_loginUser_user_favoriteItems_itemType {
  __typename: 'ItemType';
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: login_loginUser_user_favoriteItems_itemType_eligibleItemSlots[];
}

export interface login_loginUser_user_favoriteItems_set_bonuses {
  __typename: 'SetBonus';
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface login_loginUser_user_favoriteItems_set {
  __typename: 'Set';
  id: any;
  name: string;
  bonuses: login_loginUser_user_favoriteItems_set_bonuses[];
}

export interface login_loginUser_user_favoriteItems_buffs {
  __typename: 'Buff';
  id: any;
  stat: Stat;
  incrementBy: number | null;
  critIncrementBy: number | null;
  maxStacks: number | null;
}

export interface login_loginUser_user_favoriteItems {
  __typename: 'Item';
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: login_loginUser_user_favoriteItems_stats[];
  weaponStats: login_loginUser_user_favoriteItems_weaponStats | null;
  conditions: any | null;
  itemType: login_loginUser_user_favoriteItems_itemType;
  set: login_loginUser_user_favoriteItems_set | null;
  buffs: login_loginUser_user_favoriteItems_buffs[] | null;
}

export interface login_loginUser_user {
  __typename: 'User';
  id: any;
  favoriteItems: login_loginUser_user_favoriteItems[];
  username: string;
  email: string;
  verified: boolean;
}

export interface login_loginUser {
  __typename: 'LoginUser';
  user: login_loginUser_user | null;
}

export interface login {
  loginUser: login_loginUser | null;
}

export interface loginVariables {
  email: string;
  password: string;
  remember: boolean;
}
