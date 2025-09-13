import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation mageEquippedItem(
    $stats: [CustomSetExosInput!]!
    $equippedItemId: UUID!
    $weaponElementMage: WeaponElementMage
  ) {
    mageEquippedItem(
      equippedItemId: $equippedItemId
      stats: $stats
      weaponElementMage: $weaponElementMage
    ) {
      equippedItem {
        id
        exos {
          id
          stat
          value
        }
        weaponElementMage
      }
    }
  }
`);