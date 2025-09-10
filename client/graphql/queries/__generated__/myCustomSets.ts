/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomSetFilters, BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: myCustomSets
// ====================================================

export interface myCustomSets_currentUser_customSets_edges_node_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  maleFaceImageUrl: string;
  femaleFaceImageUrl: string;
}

export interface myCustomSets_currentUser_customSets_edges_node_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface myCustomSets_currentUser_customSets_edges_node_equippedItems_item {
  __typename: "Item";
  id: any;
  imageUrl: string;
}

export interface myCustomSets_currentUser_customSets_edges_node_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: myCustomSets_currentUser_customSets_edges_node_equippedItems_slot;
  item: myCustomSets_currentUser_customSets_edges_node_equippedItems_item;
}

export interface myCustomSets_currentUser_customSets_edges_node_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface myCustomSets_currentUser_customSets_edges_node_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: myCustomSets_currentUser_customSets_edges_node_tagAssociations_customSetTag;
}

export interface myCustomSets_currentUser_customSets_edges_node {
  __typename: "CustomSet";
  id: any;
  private: boolean;
  buildGender: BuildGender;
  defaultClass: myCustomSets_currentUser_customSets_edges_node_defaultClass | null;
  name: string | null;
  level: number;
  equippedItems: myCustomSets_currentUser_customSets_edges_node_equippedItems[];
  tagAssociations: myCustomSets_currentUser_customSets_edges_node_tagAssociations[];
}

export interface myCustomSets_currentUser_customSets_edges {
  __typename: "CustomSetEdge";
  node: myCustomSets_currentUser_customSets_edges_node;
}

export interface myCustomSets_currentUser_customSets_pageInfo {
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

export interface myCustomSets_currentUser_customSets {
  __typename: "CustomSetConnection";
  edges: myCustomSets_currentUser_customSets_edges[];
  totalCount: number;
  /**
   * Pagination data for this connection.
   */
  pageInfo: myCustomSets_currentUser_customSets_pageInfo;
}

export interface myCustomSets_currentUser {
  __typename: "User";
  id: any;
  customSets: myCustomSets_currentUser_customSets;
}

export interface myCustomSets {
  currentUser: myCustomSets_currentUser | null;
}

export interface myCustomSetsVariables {
  first: number;
  after?: string | null;
  filters: CustomSetFilters;
}
