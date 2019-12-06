// lib/withApollo.js
import withApollo from "next-with-apollo";
import ApolloClient, { InMemoryCache } from "apollo-boost";

export default withApollo(
  ({ ctx, headers, initialState }) =>
    new ApolloClient({
      uri: process.env.GRAPHQL_URI,
      cache: new InMemoryCache().restore(initialState || {})
    })
);
