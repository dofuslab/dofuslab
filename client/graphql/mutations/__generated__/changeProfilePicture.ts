/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: changeProfilePicture
// ====================================================

export interface changeProfilePicture_changeProfilePicture_user {
  __typename: "User";
  id: any;
  profilePicture: string;
}

export interface changeProfilePicture_changeProfilePicture {
  __typename: "ChangeProfilePicture";
  user: changeProfilePicture_changeProfilePicture_user | null;
  ok: boolean;
}

export interface changeProfilePicture {
  changeProfilePicture: changeProfilePicture_changeProfilePicture | null;
}

export interface changeProfilePictureVariables {
  picture: string;
}
