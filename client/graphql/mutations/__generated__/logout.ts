/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type logoutVariables = Types.Exact<{ [key: string]: never }>;

export type logout = {
  logoutUser: { __typename: 'LogoutUser'; ok: boolean } | null;
};
