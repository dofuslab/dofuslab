/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type customSetTagsVariables = Types.Exact<{ [key: string]: never }>;

export type customSetTags = {
  customSetTags: Array<{
    __typename: 'CustomSetTag';
    id: any;
    name: string;
    imageUrl: string;
  }>;
};
