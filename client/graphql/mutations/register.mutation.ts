import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation register(
    $email: String!
    $password: String!
    $username: String!
    $gender: BuildGender!
    $buildDefaultClassId: UUID
  ) {
    registerUser(
      email: $email
      password: $password
      username: $username
      gender: $gender
      buildDefaultClassId: $buildDefaultClassId
    ) {
      user {
        id
        favoriteItems {
          ...item
        }
        username
        email
        verified
        settings {
          id
          buildGender
          buildClass {
            id
            maleFaceImageUrl
            femaleFaceImageUrl
            maleSpriteImageUrl
            femaleSpriteImageUrl
            name
          }
        }
      }
    }
  }
`);