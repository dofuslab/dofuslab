/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: login
// ====================================================

export interface login_loginUser_user {
  __typename: "User";
  id: any;
  username: string;
}

export interface login_loginUser {
  __typename: "LoginUser";
  user: login_loginUser_user | null;
}

export interface login {
  loginUser: login_loginUser | null;
}

export interface loginVariables {
  email: string;
  password: string;
  remember: boolean;
}
