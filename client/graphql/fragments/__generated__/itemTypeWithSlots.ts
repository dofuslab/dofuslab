/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type itemTypeWithSlots = {
  __typename: 'ItemType';
  id: any;
  name: string;
  enName: string;
  eligibleItemSlots: Array<{
    __typename: 'ItemSlot';
    id: any;
    enName: string;
    order: number;
  }>;
};
