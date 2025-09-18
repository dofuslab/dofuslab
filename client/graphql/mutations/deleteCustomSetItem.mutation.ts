import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation deleteCustomSetItem($itemSlotId: UUID!, $customSetId: UUID!) {
    deleteCustomSetItem(itemSlotId: $itemSlotId, customSetId: $customSetId) {
      customSet {
        id
        lastModified
        equippedItems {
          id
        }
      }
    }
  }
`);