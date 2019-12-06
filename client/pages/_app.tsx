import App from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import withApollo from "../common/apollo";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";

class DofusSetsApp extends App<{
  apollo: ApolloClient<NormalizedCacheObject>;
}> {
  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(DofusSetsApp);
