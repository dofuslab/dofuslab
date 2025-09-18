/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type classesVariables = Types.Exact<{ [key: string]: never }>;

export type classes = {
  classes: Array<{
    __typename: 'Class';
    id: any;
    name: string;
    enName: string;
    allNames: Array<string>;
    maleFaceImageUrl: string;
    femaleFaceImageUrl: string;
    maleSpriteImageUrl: string;
    femaleSpriteImageUrl: string;
  }>;
};
