import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  query set($id: UUID!) {
    setById(id: $id) {
      ...set
      items {
        ...item
      }
    }
  }
`);