/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: register
// ====================================================

export interface register_registerUser_user {
  __typename: "User";
  id: any;
  username: string;
}

export interface register_registerUser {
  __typename: "RegisterUser";
  user: register_registerUser_user | null;
}

export interface register {
  registerUser: register_registerUser | null;
}

export interface registerVariables {
  email: string;
  password: string;
  username: string;
}
