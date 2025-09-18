/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type resetPasswordVariables = Types.Exact<{
  token: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
}>;

export type resetPassword = {
  resetPassword: { __typename: 'ResetPassword'; ok: boolean } | null;
};
