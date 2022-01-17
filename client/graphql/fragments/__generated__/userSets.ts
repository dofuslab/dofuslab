/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: userSets
// ====================================================

export interface userSets_customSets_edges_node_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  faceImageUrl: string;
}

export interface userSets_customSets_edges_node_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface userSets_customSets_edges_node_equippedItems_item {
  __typename: "Item";
  id: any;
  imageUrl: string;
}

export interface userSets_customSets_edges_node_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: userSets_customSets_edges_node_equippedItems_slot;
  item: userSets_customSets_edges_node_equippedItems_item;
}

export interface userSets_customSets_edges_node_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface userSets_customSets_edges_node_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: userSets_customSets_edges_node_tagAssociations_customSetTag;
}

export interface userSets_customSets_edges_node {
  __typename: "CustomSet";
  id: any;
  defaultClass: userSets_customSets_edges_node_defaultClass | null;
  name: string | null;
  level: number;
  equippedItems: userSets_customSets_edges_node_equippedItems[];
  tagAssociations: userSets_customSets_edges_node_tagAssociations[];
}

export interface userSets_customSets_edges {
  __typename: "CustomSetEdge";
  node: userSets_customSets_edges_node;
}

export interface userSets_customSets_pageInfo {
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

export interface userSets_customSets {
  __typename: "CustomSetConnection";
  edges: userSets_customSets_edges[];
  /**
   * Pagination data for this connection.
   */
  pageInfo: userSets_customSets_pageInfo;
}

export interface userSets {
  __typename: "User";
  customSets: userSets_customSets;
}
