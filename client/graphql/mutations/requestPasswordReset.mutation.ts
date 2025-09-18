import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation requestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      ok
    }
  }
`);