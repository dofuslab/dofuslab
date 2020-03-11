import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { appWithTranslation } from '../i18n';

class DofusSetsApp extends App<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
}> {
  async componentDidMount() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (err) {
        console.error('Service worker registration failed', err);
      }
    } else {
      console.log('Service worker not supported');
    }
  }
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
