/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomSetFilters, BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: buildList
// ====================================================

export interface buildList_userByName_customSets_edges_node_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  maleFaceImageUrl: string;
  femaleFaceImageUrl: string;
}

export interface buildList_userByName_customSets_edges_node_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface buildList_userByName_customSets_edges_node_equippedItems_item {
  __typename: "Item";
  id: any;
  imageUrl: string;
}

export interface buildList_userByName_customSets_edges_node_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: buildList_userByName_customSets_edges_node_equippedItems_slot;
  item: buildList_userByName_customSets_edges_node_equippedItems_item;
}

export interface buildList_userByName_customSets_edges_node_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface buildList_userByName_customSets_edges_node_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: buildList_userByName_customSets_edges_node_tagAssociations_customSetTag;
}

export interface buildList_userByName_customSets_edges_node {
  __typename: "CustomSet";
  id: any;
  private: boolean;
  buildGender: BuildGender;
  defaultClass: buildList_userByName_customSets_edges_node_defaultClass | null;
  name: string | null;
  level: number;
  equippedItems: buildList_userByName_customSets_edges_node_equippedItems[];
  tagAssociations: buildList_userByName_customSets_edges_node_tagAssociations[];
}

export interface buildList_userByName_customSets_edges {
  __typename: "CustomSetEdge";
  node: buildList_userByName_customSets_edges_node;
}

export interface buildList_userByName_customSets_pageInfo {
  __typename: "PageInfo";
  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean;
  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null;
}

export interface buildList_userByName_customSets {
  __typename: "CustomSetConnection";
  edges: buildList_userByName_customSets_edges[];
  totalCount: number;
  /**
   * Pagination data for this connection.
   */
  pageInfo: buildList_userByName_customSets_pageInfo;
}

export interface buildList_userByName {
  __typename: "User";
  id: any;
  username: string;
  customSets: buildList_userByName_customSets;
}

export interface buildList {
  userByName: buildList_userByName | null;
}

export interface buildListVariables {
  username: string;
  first: number;
  after?: string | null;
  filters: CustomSetFilters;
}
