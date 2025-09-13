import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  mutation changeLocale($locale: String!) {
    changeLocale(locale: $locale) {
      ok
    }
  }
`);