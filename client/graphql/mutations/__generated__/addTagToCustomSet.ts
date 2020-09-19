/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: addTagToCustomSet
// ====================================================

export interface addTagToCustomSet_addTagToCustomSet_customSet_tags {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface addTagToCustomSet_addTagToCustomSet_customSet {
  __typename: "CustomSet";
  id: any;
  tags: addTagToCustomSet_addTagToCustomSet_customSet_tags[];
}

export interface addTagToCustomSet_addTagToCustomSet {
  __typename: "AddTagToCustomSet";
  customSet: addTagToCustomSet_addTagToCustomSet_customSet;
}

export interface addTagToCustomSet {
  addTagToCustomSet: addTagToCustomSet_addTagToCustomSet | null;
}

export interface addTagToCustomSetVariables {
  customSetId?: any | null;
  customSetTagId: any;
}
