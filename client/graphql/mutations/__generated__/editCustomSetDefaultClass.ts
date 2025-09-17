/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type editCustomSetDefaultClassVariables = Types.Exact<{
  customSetId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
  defaultClassId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
  buildGender: Types.BuildGender;
}>;

export type editCustomSetDefaultClass = {
  editCustomSetDefaultClass: {
    __typename: 'EditCustomSetDefaultClass';
    customSet: {
      __typename: 'CustomSet';
      id: any;
      lastModified: any | null;
      buildGender: Types.BuildGender;
      defaultClass: {
        __typename: 'Class';
        id: any;
        name: string;
        enName: string;
        femaleFaceImageUrl: string;
        maleFaceImageUrl: string;
        femaleSpriteImageUrl: string;
        maleSpriteImageUrl: string;
      } | null;
    };
  } | null;
};
