/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type deleteCustomSetVariables = Types.Exact<{
  customSetId: Types.Scalars['UUID']['input'];
}>;

export type deleteCustomSet = {
  deleteCustomSet: { __typename: 'DeleteCustomSet'; ok: boolean } | null;
};
