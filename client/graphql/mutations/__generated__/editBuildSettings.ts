/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BuildGender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: editBuildSettings
// ====================================================

export interface editBuildSettings_editBuildSettings_userSetting_buildClass {
  __typename: "Class";
  id: any;
  name: string;
  maleFaceImageUrl: string;
  femaleFaceImageUrl: string;
  maleSpriteImageUrl: string;
  femaleSpriteImageUrl: string;
}

export interface editBuildSettings_editBuildSettings_userSetting {
  __typename: "UserSetting";
  id: any;
  buildGender: BuildGender;
  buildClass: editBuildSettings_editBuildSettings_userSetting_buildClass | null;
}

export interface editBuildSettings_editBuildSettings {
  __typename: "EditBuildSettings";
  userSetting: editBuildSettings_editBuildSettings_userSetting;
}

export interface editBuildSettings {
  editBuildSettings: editBuildSettings_editBuildSettings | null;
}

export interface editBuildSettingsVariables {
  gender: BuildGender;
  buildDefaultClassId?: any | null;
}
