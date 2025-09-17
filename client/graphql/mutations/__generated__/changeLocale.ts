/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type changeLocaleVariables = Types.Exact<{
  locale: Types.Scalars['String']['input'];
}>;

export type changeLocale = {
  changeLocale: { __typename: 'ChangeLocale'; ok: boolean } | null;
};
