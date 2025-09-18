import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query classBuffs($id: UUID!) {
    classById(id: $id) {
      id
      name
      spellVariantPairs {
        id
        spells {
          id
          name
          description
          imageUrl
          spellStats {
            id
            level
            buffs {
              ...buff
            }
          }
        }
      }
    }
  }
`);