import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation removeTagFromCustomSet($customSetId: UUID, $customSetTagId: UUID!) {
    removeTagFromCustomSet(
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