import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation changeClassic($classic: Boolean!) {
    changeClassic(classic: $classic) {
      ok
    }
  }
`);