import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation copyCustomSet($customSetId: UUID!) {
    copyCustomSet(customSetId: $customSetId) {
      customSet {
        ...customSet
      }
    }
  }
`);