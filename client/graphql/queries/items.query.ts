import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query items(
    $first: Int!
    $after: String
    $filters: ItemFilters!
    $equippedItemIds: [UUID!]!
    $eligibleItemTypeIds: [UUID!]
    $level: Int!
  ) {
    items(first: $first, after: $after, filters: $filters) {
      edges {
        node {
          ...item
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }

    itemSuggestions(
      eligibleItemTypeIds: $eligibleItemTypeIds
      equippedItemIds: $equippedItemIds
      level: $level
    ) {
      ...item
    }
  }
`);