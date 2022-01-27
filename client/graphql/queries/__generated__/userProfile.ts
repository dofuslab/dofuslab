/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: userProfile
// ====================================================

export interface userProfile_userByName_customSets {
  __typename: 'CustomSetConnection';
  totalCount: number;
}

export interface userProfile_userByName {
  __typename: 'User';
  id: any;
  username: string;
  profilePicture: string;
  creationDate: any | null;
  customSets: userProfile_userByName_customSets;
}

export interface userProfile {
  userByName: userProfile_userByName | null;
}

export interface userProfileVariables {
  username: string;
}
