/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: requestPasswordReset
// ====================================================

export interface requestPasswordReset_requestPasswordReset {
  __typename: 'RequestPasswordReset';
  ok: boolean;
}

export interface requestPasswordReset {
  requestPasswordReset: requestPasswordReset_requestPasswordReset | null;
}

export interface requestPasswordResetVariables {
  email: string;
}
