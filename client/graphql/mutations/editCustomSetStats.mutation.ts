import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation editCustomSetStats($customSetId: UUID, $stats: CustomSetStatsInput!) {
    editCustomSetStats(customSetId: $customSetId, stats: $stats) {
      customSet {
        id
        lastModified
        stats {
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
      }
    }
  }
`);