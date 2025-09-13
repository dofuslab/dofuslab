import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation equipSet($customSetId: UUID, $setId: UUID!) {
    equipSet(customSetId: $customSetId, setId: $setId) {
      customSet {
        ...customSet
      }
    }
  }
`);