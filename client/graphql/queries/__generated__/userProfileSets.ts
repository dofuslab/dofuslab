/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomSetFilters } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: userProfileSets
// ====================================================

export interface userProfileSets_userByName_customSets_edges_node_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  faceImageUrl: string;
}

export interface userProfileSets_userByName_customSets_edges_node_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface userProfileSets_userByName_customSets_edges_node_equippedItems_item {
  __typename: "Item";
  id: any;
  imageUrl: string;
}

export interface userProfileSets_userByName_customSets_edges_node_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: userProfileSets_userByName_customSets_edges_node_equippedItems_slot;
  item: userProfileSets_userByName_customSets_edges_node_equippedItems_item;
}

export interface userProfileSets_userByName_customSets_edges_node_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface userProfileSets_userByName_customSets_edges_node_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: userProfileSets_userByName_customSets_edges_node_tagAssociations_customSetTag;
}

export interface userProfileSets_userByName_customSets_edges_node {
  __typename: "CustomSet";
  id: any;
  defaultClass: userProfileSets_userByName_customSets_edges_node_defaultClass | null;
  name: string | null;
  level: number;
  equippedItems: userProfileSets_userByName_customSets_edges_node_equippedItems[];
  tagAssociations: userProfileSets_userByName_customSets_edges_node_tagAssociations[];
}

export interface userProfileSets_userByName_customSets_edges {
  __typename: "CustomSetEdge";
  node: userProfileSets_userByName_customSets_edges_node;
}

export interface userProfileSets_userByName_customSets_pageInfo {
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

export interface userProfileSets_userByName_customSets {
  __typename: "CustomSetConnection";
  edges: userProfileSets_userByName_customSets_edges[];
  /**
   * Pagination data for this connection.
   */
  pageInfo: userProfileSets_userByName_customSets_pageInfo;
}

export interface userProfileSets_userByName {
  __typename: "User";
  username: string;
  id: any;
  customSets: userProfileSets_userByName_customSets;
}

export interface userProfileSets {
  userByName: userProfileSets_userByName | null;
}

export interface userProfileSetsVariables {
  username: string;
  first: number;
  after?: string | null;
  filters: CustomSetFilters;
}
