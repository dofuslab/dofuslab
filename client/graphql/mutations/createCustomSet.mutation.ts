import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation createCustomSet {
    createCustomSet {
      customSet {
        ...customSet
      }
    }
  }
`);