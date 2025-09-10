/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: abbreviatedCustomSet
// ====================================================

export interface abbreviatedCustomSet_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  maleFaceImageUrl: string;
  femaleFaceImageUrl: string;
}

export interface abbreviatedCustomSet_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface abbreviatedCustomSet_equippedItems_item {
  __typename: "Item";
  id: any;
  imageUrl: string;
}

export interface abbreviatedCustomSet_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: abbreviatedCustomSet_equippedItems_slot;
  item: abbreviatedCustomSet_equippedItems_item;
}

export interface abbreviatedCustomSet_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface abbreviatedCustomSet_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: abbreviatedCustomSet_tagAssociations_customSetTag;
}

export interface abbreviatedCustomSet {
  __typename: "CustomSet";
  id: any;
  private: boolean;
  buildGender: BuildGender;
  defaultClass: abbreviatedCustomSet_defaultClass | null;
  name: string | null;
  level: number;
  equippedItems: abbreviatedCustomSet_equippedItems[];
  tagAssociations: abbreviatedCustomSet_tagAssociations[];
}
