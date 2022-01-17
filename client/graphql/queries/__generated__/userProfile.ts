/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: userProfile
// ====================================================

export interface userProfile_userByName_customSets_edges_node {
  __typename: "CustomSet";
  id: any;
}

export interface userProfile_userByName_customSets_edges {
  __typename: "CustomSetEdge";
  node: userProfile_userByName_customSets_edges_node;
}

export interface userProfile_userByName_customSets_pageInfo {
  __typename: "PageInfo";
  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean;
}

export interface userProfile_userByName_customSets {
  __typename: "CustomSetConnection";
  totalCount: number;
  edges: userProfile_userByName_customSets_edges[];
  /**
   * Pagination data for this connection.
   */
  pageInfo: userProfile_userByName_customSets_pageInfo;
}

export interface userProfile_userByName {
  __typename: "User";
  id: any;
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
