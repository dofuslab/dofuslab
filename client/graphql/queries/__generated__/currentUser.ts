/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: currentUser
// ====================================================

export interface currentUser_currentUser {
  __typename: "User";
  id: any;
  username: string;
  email: string;
  verified: boolean;
}

export interface currentUser {
  currentUser: currentUser_currentUser | null;
}
