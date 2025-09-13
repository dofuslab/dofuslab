import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation addTagToCustomSet($customSetId: UUID, $customSetTagId: UUID!) {
    addTagToCustomSet(
      customSetId: $customSetId
      customSetTagId: $customSetTagId
    ) {
      customSet {
        id
        tagAssociations {
          id
          associationDate
          customSetTag {
            id
            name
            imageUrl
          }
        }
      }
    }
  }
`);