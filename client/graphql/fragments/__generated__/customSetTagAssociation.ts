/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type customSetTagAssociation = {
  __typename: 'CustomSetTagAssociation';
  id: string;
  associationDate: any;
  customSetTag: {
    __typename: 'CustomSetTag';
    id: any;
    name: string;
    imageUrl: string;
  };
};
