import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation editBuildSettings($gender: BuildGender!, $buildDefaultClassId: UUID) {
    editBuildSettings(
      gender: $gender
      buildDefaultClassId: $buildDefaultClassId
    ) {
      userSetting {
        id
        buildGender
        buildClass {
          id
          name
          maleFaceImageUrl
          femaleFaceImageUrl
          maleSpriteImageUrl
          femaleSpriteImageUrl
        }
      }
    }
  }
`);