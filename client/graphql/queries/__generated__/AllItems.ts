/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AllItems
// ====================================================

export interface AllItems_allItems_edges_node {
  __typename: "Item";
  /**
   * The ID of the object.
   */
  id: string;
  name: string;
  stats: any | null;
  conditions: any | null;
}

export interface AllItems_allItems_edges {
  __typename: "ItemEdge";
  /**
   * The item at the end of the edge
   */
  node: AllItems_allItems_edges_node | null;
}

export interface AllItems_allItems {
  __typename: "ItemConnection";
  /**
   * Contains the nodes in this connection.
   */
  edges: (AllItems_allItems_edges | null)[];
}

export interface AllItems {
  allItems: AllItems_allItems | null;
}
