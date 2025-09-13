import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  fragment set on Set {
    id
    name
    bonuses {
      id
      numItems
      stat
      value
      customStat
    }
  }
`);