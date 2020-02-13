/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: items
// ====================================================

export interface items_items {
  __typename: "Item";
  uuid: string;
  /**
   * The ID of the object.
   */
  id: string;
}

export interface items {
  items: (items_items | null)[] | null;
}
