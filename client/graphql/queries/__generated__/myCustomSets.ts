/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type myCustomSetsVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filters: Types.CustomSetFilters;
}>;

export type myCustomSets = {
  currentUser: {
    __typename: 'User';
    id: any;
    customSets: {
      __typename: 'CustomSetConnection';
      totalCount: number;
      edges: Array<{
        __typename: 'CustomSetEdge';
        node: {
          __typename: 'CustomSet';
          id: any;
          buildGender: Types.BuildGender;
          name: string | null;
          level: number;
          defaultClass: {
            __typename: 'Class';
            id: any;
            name: string;
            maleFaceImageUrl: string;
            femaleFaceImageUrl: string;
          } | null;
          equippedItems: Array<{
            __typename: 'EquippedItem';
            id: any;
            slot: { __typename: 'ItemSlot'; id: any; order: number };
            item: { __typename: 'Item'; id: any; imageUrl: string };
          }>;
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
      }>;
      pageInfo: {
        __typename: 'PageInfo';
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  } | null;
};
