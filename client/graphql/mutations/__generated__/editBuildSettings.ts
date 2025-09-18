/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type editBuildSettingsVariables = Types.Exact<{
  gender: Types.BuildGender;
  buildDefaultClassId?: Types.InputMaybe<Types.Scalars['UUID']['input']>;
}>;

export type editBuildSettings = {
  editBuildSettings: {
    __typename: 'EditBuildSettings';
    userSetting: {
      __typename: 'UserSetting';
      id: any;
      buildGender: Types.BuildGender;
      buildClass: {
        __typename: 'Class';
        id: any;
        name: string;
        maleFaceImageUrl: string;
        femaleFaceImageUrl: string;
        maleSpriteImageUrl: string;
        femaleSpriteImageUrl: string;
      } | null;
    };
  } | null;
};
