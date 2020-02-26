/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: currentUser
// ====================================================

export interface currentUser_currentUser {
  __typename: "User";
  /**
   * The ID of the object.
   */
  id: string;
  username: string;
}

export interface currentUser {
  currentUser: currentUser_currentUser | null;
}
