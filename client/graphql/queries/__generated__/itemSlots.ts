/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type itemSlotsVariables = Types.Exact<{ [key: string]: never }>;

export type itemSlots = {
  itemSlots: Array<{
    __typename: 'ItemSlot';
    id: any;
    enName: string;
    name: string;
    order: number;
    imageUrl: string;
    itemTypes: Array<{ __typename: 'ItemType'; id: any; name: string }>;
  }>;
};
