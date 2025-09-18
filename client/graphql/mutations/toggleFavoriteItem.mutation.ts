import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation toggleFavoriteItem($itemId: UUID!, $isFavorite: Boolean!) {
    toggleFavoriteItem(itemId: $itemId, isFavorite: $isFavorite) {
      user {
        id
        favoriteItems {
          ...item
        }
      }
    }
  }
`);