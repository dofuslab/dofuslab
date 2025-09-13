import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation changeProfilePicture($picture: String!) {
    changeProfilePicture(picture: $picture) {
      user {
        id
        profilePicture
      }
    }
  }
`);