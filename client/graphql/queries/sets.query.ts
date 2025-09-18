import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query sets($first: Int!, $after: String, $filters: SetFilters!) {
    sets(first: $first, after: $after, filters: $filters) {
      edges {
        node {
          ...set
          items {
            ...item
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);