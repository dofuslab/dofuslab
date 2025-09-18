import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query customSet($id: UUID!) {
    customSetById(id: $id) {
      ...customSet
      stats {
        ...baseStats
      }
    }
  }
`);