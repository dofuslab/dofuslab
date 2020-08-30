/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: editCustomSetMetadata
// ====================================================

export interface editCustomSetMetadata_editCustomSetMetadata_customSet {
  __typename: 'CustomSet';
  id: any;
  name: string | null;
  level: number;
  lastModified: any | null;
}

export interface editCustomSetMetadata_editCustomSetMetadata {
  __typename: 'EditCustomSetMetadata';
  customSet: editCustomSetMetadata_editCustomSetMetadata_customSet;
}

export interface editCustomSetMetadata {
  editCustomSetMetadata: editCustomSetMetadata_editCustomSetMetadata | null;
}

export interface editCustomSetMetadataVariables {
  customSetId?: any | null;
  name?: string | null;
  level: number;
}
