import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query classes {
    classes {
      id
      name
      enName
      allNames
      maleFaceImageUrl
      femaleFaceImageUrl
      maleSpriteImageUrl
      femaleSpriteImageUrl
    }
  }
`);