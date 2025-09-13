import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query userProfile($username: String!) {
    userByName(username: $username) {
      id
      username
      profilePicture
      creationDate
      customSets(filters: { search: "", tagIds: [] }) {
        totalCount
      }
    }
  }
`);