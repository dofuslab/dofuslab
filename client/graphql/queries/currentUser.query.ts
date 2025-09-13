import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query currentUser {
    currentUser {
      id
      username
      email
      verified
      favoriteItems {
        ...item
      }
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
`);