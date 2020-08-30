/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: myCustomSets
// ====================================================

export interface myCustomSets_currentUser_customSets_edges_node_equippedItems_slot {
  __typename: 'ItemSlot';
  id: any;
  order: number;
}

export interface myCustomSets_currentUser_customSets_edges_node_equippedItems_item {
  __typename: 'Item';
  id: any;
  imageUrl: string;
}

export interface myCustomSets_currentUser_customSets_edges_node_equippedItems {
  __typename: 'EquippedItem';
  id: any;
  slot: myCustomSets_currentUser_customSets_edges_node_equippedItems_slot;
  item: myCustomSets_currentUser_customSets_edges_node_equippedItems_item;
}

export interface myCustomSets_currentUser_customSets_edges_node {
  __typename: 'CustomSet';
  id: any;
  name: string | null;
  level: number;
  equippedItems: myCustomSets_currentUser_customSets_edges_node_equippedItems[];
}

export interface myCustomSets_currentUser_customSets_edges {
  __typename: 'CustomSetEdge';
  node: myCustomSets_currentUser_customSets_edges_node;
}

export interface myCustomSets_currentUser_customSets_pageInfo {
  __typename: 'PageInfo';
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
  __typename: 'CustomSetConnection';
  edges: myCustomSets_currentUser_customSets_edges[];
  /**
   * Pagination data for this connection.
   */
  pageInfo: myCustomSets_currentUser_customSets_pageInfo;
}

export interface myCustomSets_currentUser {
  __typename: 'User';
  id: any;
  customSets: myCustomSets_currentUser_customSets;
}

export interface myCustomSets {
  currentUser: myCustomSets_currentUser | null;
}

export interface myCustomSetsVariables {
  first: number;
  after?: string | null;
  search?: string | null;
}
