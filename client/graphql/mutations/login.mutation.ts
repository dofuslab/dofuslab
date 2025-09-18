import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation login($email: String!, $password: String!, $remember: Boolean!) {
    loginUser(email: $email, password: $password, remember: $remember) {
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