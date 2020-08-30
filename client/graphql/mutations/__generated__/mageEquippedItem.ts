/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  CustomSetExosInput,
  WeaponElementMage,
  Stat,
} from './../../../__generated__/globalTypes';

// ====================================================
// GraphQL mutation operation: mageEquippedItem
// ====================================================

export interface mageEquippedItem_mageEquippedItem_equippedItem_exos {
  __typename: 'EquippedItemExo';
  id: any;
  stat: Stat;
  value: number;
}

export interface mageEquippedItem_mageEquippedItem_equippedItem {
  __typename: 'EquippedItem';
  id: any;
  exos: mageEquippedItem_mageEquippedItem_equippedItem_exos[];
  weaponElementMage: WeaponElementMage | null;
}

export interface mageEquippedItem_mageEquippedItem {
  __typename: 'MageEquippedItem';
  equippedItem: mageEquippedItem_mageEquippedItem_equippedItem;
}

export interface mageEquippedItem {
  mageEquippedItem: mageEquippedItem_mageEquippedItem | null;
}

export interface mageEquippedItemVariables {
  stats: CustomSetExosInput[];
  equippedItemId: any;
  weaponElementMage?: WeaponElementMage | null;
}
