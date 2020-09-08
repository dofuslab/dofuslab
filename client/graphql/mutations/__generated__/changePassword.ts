/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: changePassword
// ====================================================

export interface changePassword_changePassword {
  __typename: "ChangePassword";
  ok: boolean;
}

export interface changePassword {
  changePassword: changePassword_changePassword | null;
}

export interface changePasswordVariables {
  oldPassword: string;
  newPassword: string;
}
