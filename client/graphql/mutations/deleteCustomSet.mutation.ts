import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation deleteCustomSet($customSetId: UUID!) {
    deleteCustomSet(customSetId: $customSetId) {
      ok
    }
  }
`);