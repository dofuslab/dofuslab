/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type userProfileVariables = Types.Exact<{
  username: Types.Scalars['String']['input'];
}>;

export type userProfile = {
  userByName: {
    __typename: 'User';
    id: any;
    username: string;
    profilePicture: string;
    creationDate: any | null;
    customSets: { __typename: 'CustomSetConnection'; totalCount: number };
  } | null;
};
