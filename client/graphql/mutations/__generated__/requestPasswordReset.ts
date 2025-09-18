/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type requestPasswordResetVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
}>;

export type requestPasswordReset = {
  requestPasswordReset: {
    __typename: 'RequestPasswordReset';
    ok: boolean;
  } | null;
};
