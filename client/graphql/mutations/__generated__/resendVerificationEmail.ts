/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type resendVerificationEmailVariables = Types.Exact<{
  [key: string]: never;
}>;

export type resendVerificationEmail = {
  resendVerificationEmail: {
    __typename: 'ResendVerificationEmail';
    ok: boolean;
  } | null;
};
