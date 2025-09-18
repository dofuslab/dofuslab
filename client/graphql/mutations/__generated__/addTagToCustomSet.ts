/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type addTagToCustomSetVariables = Types.Exact<{
  customSetId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
  customSetTagId: Types.Scalars['UUID']['input'];
}>;

export type addTagToCustomSet = {
  addTagToCustomSet: {
    __typename: 'AddTagToCustomSet';
    customSet: {
      __typename: 'CustomSet';
      id: any;
      tagAssociations: Array<{
        __typename: 'CustomSetTagAssociation';
        id: string;
        associationDate: any;
        customSetTag: {
          __typename: 'CustomSetTag';
          id: any;
          name: string;
          imageUrl: string;
        };
      }>;
    };
  } | null;
};
