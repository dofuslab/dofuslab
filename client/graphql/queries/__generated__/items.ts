/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: items
// ====================================================

export interface items_items_stats {
  __typename: "ItemStats";
  minValue: number | null;
  maxValue: number | null;
  stat: Stat | null;
}

export interface items_items {
  __typename: "Item";
  /**
   * The ID of the object.
   */
  id: string;
  stats: (items_items_stats | null)[] | null;
}

export interface items {
  items: (items_items | null)[] | null;
}
