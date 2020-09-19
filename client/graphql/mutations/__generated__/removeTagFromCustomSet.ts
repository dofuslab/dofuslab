/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: removeTagFromCustomSet
// ====================================================

export interface removeTagFromCustomSet_removeTagFromCustomSet_customSet_tagAssociations_customSetTag {
  __typename: "CustomSetTag";
  id: any;
  name: string;
  imageUrl: string;
}

export interface removeTagFromCustomSet_removeTagFromCustomSet_customSet_tagAssociations {
  __typename: "CustomSetTagAssociation";
  id: string;
  associationDate: any;
  customSetTag: removeTagFromCustomSet_removeTagFromCustomSet_customSet_tagAssociations_customSetTag;
}

export interface removeTagFromCustomSet_removeTagFromCustomSet_customSet {
  __typename: "CustomSet";
  id: any;
  tagAssociations: removeTagFromCustomSet_removeTagFromCustomSet_customSet_tagAssociations[];
}

export interface removeTagFromCustomSet_removeTagFromCustomSet {
  __typename: "RemoveTagFromCustomSet";
  customSet: removeTagFromCustomSet_removeTagFromCustomSet_customSet;
}

export interface removeTagFromCustomSet {
  removeTagFromCustomSet: removeTagFromCustomSet_removeTagFromCustomSet | null;
}

export interface removeTagFromCustomSetVariables {
  customSetId?: any | null;
  customSetTagId: any;
}
