/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: items
// ====================================================

export interface items_items_stats {
  __typename: "ItemStats";
  maxValue: number | null;
  stat: Stat | null;
}

export interface items_items_conditions {
  __typename: "ItemCondtions";
  stat: Stat | null;
  isGreaterThan: boolean | null;
  limit: number | null;
}

export interface items_items {
  __typename: "Item";
  /**
   * The ID of the object.
   */
  id: string;
  name: string;
  stats: items_items_stats[];
  conditions: items_items_conditions[];
}

export interface items {
  items: items_items[];
}
