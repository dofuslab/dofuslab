/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type changePasswordVariables = Types.Exact<{
  oldPassword: Types.Scalars['String']['input'];
  newPassword: Types.Scalars['String']['input'];
}>;

export type changePassword = {
  changePassword: { __typename: 'ChangePassword'; ok: boolean } | null;
};
