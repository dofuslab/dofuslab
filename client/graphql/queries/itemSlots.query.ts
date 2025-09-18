import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query itemSlots {
    itemSlots {
      id
      enName
      name
      order
      itemTypes {
        id
        name
      }
      imageUrl
    }
  }
`);