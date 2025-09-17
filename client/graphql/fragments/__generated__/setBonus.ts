/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type setBonus = {
  __typename: 'SetBonus';
  id: any;
  numItems: number;
  stat: Types.Stat | null;
  value: number | null;
  customStat: string | null;
};
