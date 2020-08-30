/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from './../../../__generated__/globalTypes';

// ====================================================
// GraphQL mutation operation: setEquippedItemExo
// ====================================================

export interface setEquippedItemExo_setEquippedItemExo_equippedItem_exos {
  __typename: 'EquippedItemExo';
  id: any;
  stat: Stat;
  value: number;
}

export interface setEquippedItemExo_setEquippedItemExo_equippedItem {
  __typename: 'EquippedItem';
  id: any;
  exos: setEquippedItemExo_setEquippedItemExo_equippedItem_exos[];
}

export interface setEquippedItemExo_setEquippedItemExo {
  __typename: 'SetEquippedItemExo';
  equippedItem: setEquippedItemExo_setEquippedItemExo_equippedItem;
}

export interface setEquippedItemExo {
  setEquippedItemExo: setEquippedItemExo_setEquippedItemExo | null;
}

export interface setEquippedItemExoVariables {
  stat: Stat;
  equippedItemId: any;
  hasStat: boolean;
}
