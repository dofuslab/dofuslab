/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type editCustomSetMetadataVariables = Types.Exact<{
  customSetId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
  level: Types.Scalars['Int']['input'];
}>;

export type editCustomSetMetadata = {
  editCustomSetMetadata: {
    __typename: 'EditCustomSetMetadata';
    customSet: {
      __typename: 'CustomSet';
      id: any;
      name: string | null;
      level: number;
      lastModified: any | null;
    };
  } | null;
};
