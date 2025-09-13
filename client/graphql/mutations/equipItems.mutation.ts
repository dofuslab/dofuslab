import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation equipItems($customSetId: UUID, $itemIds: [UUID!]!) {
    equipMultipleItems(customSetId: $customSetId, itemIds: $itemIds) {
      customSet {
        ...customSet
      }
    }
  }
`);