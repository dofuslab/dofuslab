/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: editProfilePicture
// ====================================================

export interface editProfilePicture_editProfilePicture_user {
  __typename: "User";
  id: any;
  profilePicture: string;
}

export interface editProfilePicture_editProfilePicture {
  __typename: "EditProfilePicture";
  user: editProfilePicture_editProfilePicture_user;
}

export interface editProfilePicture {
  editProfilePicture: editProfilePicture_editProfilePicture | null;
}

export interface editProfilePictureVariables {
  picture: string;
}
