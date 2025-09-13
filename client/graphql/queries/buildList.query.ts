import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query buildList(
    $username: String!
    $first: Int!
    $after: String
    $filters: CustomSetFilters!
  ) {
    userByName(username: $username) {
      id
      username
      customSets(first: $first, after: $after, filters: $filters) {
        edges {
          node {
            ...abbreviatedCustomSet
          }
        }
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`);