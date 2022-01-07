/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: editCustomSetDefaultClass
// ====================================================

export interface editCustomSetDefaultClass_editCustomSetDefaultClass_customSet_defaultClass {
  __typename: "Class";
  id: any;
  name: string;
  enName: string;
  femaleFaceImageUrl: string;
  maleFaceImageUrl: string;
  femaleSpriteImageUrl: string;
  maleSpriteImageUrl: string;
}

export interface editCustomSetDefaultClass_editCustomSetDefaultClass_customSet {
  __typename: "CustomSet";
  id: any;
  lastModified: any | null;
  defaultClass: editCustomSetDefaultClass_editCustomSetDefaultClass_customSet_defaultClass | null;
  buildGender: BuildGender;
}

export interface editCustomSetDefaultClass_editCustomSetDefaultClass {
  __typename: "EditCustomSetDefaultClass";
  customSet: editCustomSetDefaultClass_editCustomSetDefaultClass_customSet;
}

export interface editCustomSetDefaultClass {
  editCustomSetDefaultClass: editCustomSetDefaultClass_editCustomSetDefaultClass | null;
}

export interface editCustomSetDefaultClassVariables {
  customSetId?: any | null;
  defaultClassId?: any | null;
  buildGender: BuildGender;
}
