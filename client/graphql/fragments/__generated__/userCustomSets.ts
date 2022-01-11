/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: userCustomSets
// ====================================================

export interface userCustomSets_customSets_edges_node_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  faceImageUrl: string;
}

export interface userCustomSets_customSets_edges_node_equippedItems_slot {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface userCustomSets_customSets_edges_node_equippedItems_item {
  __typename: "Item";
  id: any;
  imageUrl: string;
}

export interface userCustomSets_customSets_edges_node_equippedItems {
  __typename: "EquippedItem";
  id: any;
  slot: userCustomSets_customSets_edges_node_equippedItems_slot;
  item: userCustomSets_customSets_edges_node_equippedItems_item;
}

export interface userCustomSets_customSets_edges_node_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface userCustomSets_customSets_edges_node_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: userCustomSets_customSets_edges_node_tagAssociations_customSetTag;
}

export interface userCustomSets_customSets_edges_node {
  __typename: "CustomSet";
  id: any;
  defaultClass: userCustomSets_customSets_edges_node_defaultClass | null;
  name: string | null;
  level: number;
  equippedItems: userCustomSets_customSets_edges_node_equippedItems[];
  tagAssociations: userCustomSets_customSets_edges_node_tagAssociations[];
}

export interface userCustomSets_customSets_edges {
  __typename: "CustomSetEdge";
  node: userCustomSets_customSets_edges_node;
}

export interface userCustomSets_customSets_pageInfo {
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

export interface userCustomSets_customSets {
  __typename: "CustomSetConnection";
  edges: userCustomSets_customSets_edges[];
  /**
   * Pagination data for this connection.
   */
  pageInfo: userCustomSets_customSets_pageInfo;
}

export interface userCustomSets {
  __typename: "User";
  customSets: userCustomSets_customSets;
}
