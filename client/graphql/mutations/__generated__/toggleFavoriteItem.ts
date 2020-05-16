/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat, WeaponEffectType } from './../../../__generated__/globalTypes';

// ====================================================
// GraphQL mutation operation: toggleFavoriteItem
// ====================================================

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_stats {
  __typename: 'ItemStat';
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_weaponStats_weaponEffects {
  __typename: 'WeaponEffect';
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_weaponStats {
  __typename: 'WeaponStat';
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_weaponStats_weaponEffects[];
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_itemType_eligibleItemSlots {
  __typename: 'ItemSlot';
  id: any;
  order: number;
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_itemType {
  __typename: 'ItemType';
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_itemType_eligibleItemSlots[];
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_set_bonuses {
  __typename: 'SetBonus';
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_set {
  __typename: 'Set';
  id: any;
  name: string;
  bonuses: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_set_bonuses[];
}

export interface toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems {
  __typename: 'Item';
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_stats[];
  weaponStats: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_weaponStats | null;
  conditions: any | null;
  itemType: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_itemType;
  set: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems_set | null;
}

export interface toggleFavoriteItem_toggleFavoriteItem_user {
  __typename: 'User';
  id: any;
  favoriteItems: toggleFavoriteItem_toggleFavoriteItem_user_favoriteItems[];
}

export interface toggleFavoriteItem_toggleFavoriteItem {
  __typename: 'ToggleFavoriteItem';
  user: toggleFavoriteItem_toggleFavoriteItem_user;
}

export interface toggleFavoriteItem {
  toggleFavoriteItem: toggleFavoriteItem_toggleFavoriteItem | null;
}

export interface toggleFavoriteItemVariables {
  itemId: any;
  isFavorite: boolean;
}
