import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query myCustomSets($first: Int!, $after: String, $filters: CustomSetFilters!) {
    currentUser {
      id
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