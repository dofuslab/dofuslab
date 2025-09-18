import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation setEquippedItemExo(
    $stat: Stat!
    $equippedItemId: UUID!
    $hasStat: Boolean!
  ) {
    setEquippedItemExo(
      stat: $stat
      equippedItemId: $equippedItemId
      hasStat: $hasStat
    ) {
      equippedItem {
        id
        exos {
          id
          stat
          value
        }
      }
    }
  }
`);