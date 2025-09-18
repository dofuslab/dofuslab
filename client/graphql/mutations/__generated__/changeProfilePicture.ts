/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type changeProfilePictureVariables = Types.Exact<{
  picture: Types.Scalars['String']['input'];
}>;

export type changeProfilePicture = {
  changeProfilePicture: {
    __typename: 'ChangeProfilePicture';
    user: { __typename: 'User'; id: any; profilePicture: string };
  } | null;
};
