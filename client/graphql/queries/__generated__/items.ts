/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemFilters, Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: items
// ====================================================

export interface items_items_edges_node_stats {
  __typename: "ItemStats";
  maxValue: number | null;
  stat: Stat | null;
  altStat: string | null;
}

export interface items_items_edges_node_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
}

export interface items_items_edges_node_itemType {
  __typename: "ItemType";
  id: any;
  eligibleItemSlots: items_items_edges_node_itemType_eligibleItemSlots[];
}

export interface items_items_edges_node_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  altStat: string | null;
}

export interface items_items_edges_node_set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: items_items_edges_node_set_bonuses[];
}

export interface items_items_edges_node {
  __typename: "Item";
  id: any;
  name: string;
  level: number;
  imageUrl: string;
  stats: items_items_edges_node_stats[];
  conditions: any | null;
  itemType: items_items_edges_node_itemType;
  set: items_items_edges_node_set | null;
}

export interface items_items_edges {
  __typename: "ItemEdge";
  node: items_items_edges_node;
}

export interface items_items_pageInfo {
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

export interface items_items {
  __typename: "ItemConnection";
  edges: items_items_edges[];
  /**
   * Pagination data for this connection.
   */
  pageInfo: items_items_pageInfo;
}

export interface items {
  items: items_items;
}

export interface itemsVariables {
  first: number;
  after?: string | null;
  filters: ItemFilters;
}
