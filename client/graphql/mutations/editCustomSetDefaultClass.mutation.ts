import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation editCustomSetDefaultClass(
    $customSetId: UUID
    $defaultClassId: UUID
    $buildGender: BuildGender!
  ) {
    editCustomSetDefaultClass(
      customSetId: $customSetId
      defaultClassId: $defaultClassId
      buildGender: $buildGender
    ) {
      customSet {
        id
        lastModified
        defaultClass {
          id
          name
          enName
          femaleFaceImageUrl
          maleFaceImageUrl
          femaleSpriteImageUrl
          maleSpriteImageUrl
        }
        buildGender
      }
    }
  }
`);