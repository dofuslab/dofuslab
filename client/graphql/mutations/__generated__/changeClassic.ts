/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type changeClassicVariables = Types.Exact<{
  classic: Types.Scalars['Boolean']['input'];
}>;

export type changeClassic = {
  changeClassic: { __typename: 'ChangeClassic'; ok: boolean } | null;
};
