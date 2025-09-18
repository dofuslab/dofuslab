import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  fragment baseStats on CustomSetStats {
    id
    baseVitality
    baseWisdom
    baseStrength
    baseIntelligence
    baseChance
    baseAgility
    scrolledVitality
    scrolledWisdom
    scrolledStrength
    scrolledIntelligence
    scrolledChance
    scrolledAgility
  }
`);