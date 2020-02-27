import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from '../common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { appWithTranslation } from '../i18n';

class DofusSetsApp extends App<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
}> {
  render() {
    const { Component, pageProps, apolloClient } = this.props;

    return (
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(appWithTranslation(DofusSetsApp));
