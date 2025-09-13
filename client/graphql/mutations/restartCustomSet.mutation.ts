import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation restartCustomSet($customSetId: UUID!, $shouldResetStats: Boolean!) {
    restartCustomSet(
      customSetId: $customSetId
      shouldResetStats: $shouldResetStats
    ) {
      customSet {
        ...customSet
      }
    }
  }
`);