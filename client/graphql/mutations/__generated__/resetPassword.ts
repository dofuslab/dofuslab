/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: resetPassword
// ====================================================

export interface resetPassword_resetPassword {
  __typename: 'ResetPassword';
  ok: boolean;
}

export interface resetPassword {
  resetPassword: resetPassword_resetPassword | null;
}

export interface resetPasswordVariables {
  token: string;
  password: string;
}
