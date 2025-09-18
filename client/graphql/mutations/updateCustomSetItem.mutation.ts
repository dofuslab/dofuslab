import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation updateCustomSetItem(
    $itemSlotId: UUID!
    $customSetId: UUID
    $itemId: UUID
  ) {
    updateCustomSetItem(
      itemSlotId: $itemSlotId
      customSetId: $customSetId
      itemId: $itemId
    ) {
      customSet {
        id
        equippedItems {
          id
          slot {
            id
            name
            order
          }
          item {
            ...item
          }
          exos {
            id
            stat
            value
          }
          weaponElementMage
        }
      }
    }
  }
`);