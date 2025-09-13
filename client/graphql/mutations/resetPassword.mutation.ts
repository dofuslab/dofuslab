import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation resetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      ok
    }
  }
`);