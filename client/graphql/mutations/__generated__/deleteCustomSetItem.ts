/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type deleteCustomSetItemVariables = Types.Exact<{
  itemSlotId: Types.Scalars['UUID']['input'];
  customSetId: Types.Scalars['UUID']['input'];
}>;

export type deleteCustomSetItem = {
  deleteCustomSetItem: {
    __typename: 'DeleteCustomSetItem';
    customSet: {
      __typename: 'CustomSet';
      id: any;
      lastModified: any | null;
      equippedItems: Array<{ __typename: 'EquippedItem'; id: any }>;
    };
  } | null;
};
