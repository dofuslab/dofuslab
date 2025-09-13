import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation logout {
    logoutUser {
      ok
    }
  }
`);