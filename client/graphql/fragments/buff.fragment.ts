import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  fragment buff on Buff {
    id
    stat
    incrementBy
    critIncrementBy
    maxStacks
  }
`);