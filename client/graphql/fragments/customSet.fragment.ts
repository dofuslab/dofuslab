import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  fragment customSet on CustomSet {
    id
    name
    level
    equippedItems {
      id
      slot {
        id
        enName
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
    stats {
      ...baseStats
    }
    owner {
      id
      username
    }
    defaultClass {
      id
      name
      enName
      femaleFaceImageUrl
      maleFaceImageUrl
      femaleSpriteImageUrl
      maleSpriteImageUrl
    }
    creationDate
    lastModified
    tagAssociations {
      id
      associationDate
      customSetTag {
        id
        name
        imageUrl
      }
    }
    hasEditPermission
    buildGender
  }
`);