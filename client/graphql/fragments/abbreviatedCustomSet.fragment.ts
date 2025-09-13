import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  fragment abbreviatedCustomSet on CustomSet {
    id
    buildGender
    defaultClass {
      id
      name
      maleFaceImageUrl
      femaleFaceImageUrl
    }
    name
    level
    equippedItems {
      id
      slot {
        id
        order
      }
      item {
        id
        imageUrl
      }
    }
    tagAssociations {
      id
      associationDate
      customSetTag {
        id
        name
        imageUrl
      }
    }
  }
`);