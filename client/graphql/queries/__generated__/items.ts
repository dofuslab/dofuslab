/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ItemFilters, Stat, WeaponEffectType } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: items
// ====================================================

export interface items_items_edges_node_stats {
  __typename: "ItemStat";
  id: any;
  order: number;
  maxValue: number | null;
  stat: Stat | null;
  customStat: string | null;
}

export interface items_items_edges_node_weaponStats_weaponEffects {
  __typename: "WeaponEffect";
  id: any;
  minDamage: number | null;
  maxDamage: number;
  effectType: WeaponEffectType;
}

export interface items_items_edges_node_weaponStats {
  __typename: "WeaponStat";
  id: any;
  apCost: number;
  usesPerTurn: number;
  minRange: number | null;
  maxRange: number;
  baseCritChance: number | null;
  critBonusDamage: number | null;
  weaponEffects: items_items_edges_node_weaponStats_weaponEffects[];
}

export interface items_items_edges_node_itemType_eligibleItemSlots {
  __typename: "ItemSlot";
  id: any;
  order: number;
}

export interface items_items_edges_node_itemType {
  __typename: "ItemType";
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: items_items_edges_node_itemType_eligibleItemSlots[];
}

export interface items_items_edges_node_set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStat: string | null;
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
  weaponStats: items_items_edges_node_weaponStats | null;
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
