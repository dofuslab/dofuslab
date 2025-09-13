import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation resendVerificationEmail {
    resendVerificationEmail {
      ok
    }
  }
`);