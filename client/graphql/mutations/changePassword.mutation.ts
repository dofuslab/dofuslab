import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation changePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      ok
    }
  }
`);