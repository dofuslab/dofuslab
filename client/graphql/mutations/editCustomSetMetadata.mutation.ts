import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation editCustomSetMetadata(
    $customSetId: UUID
    $name: String
    $level: Int!
  ) {
    editCustomSetMetadata(customSetId: $customSetId, name: $name, level: $level) {
      customSet {
        id
        name
        level
        lastModified
      }
    }
  }
`);