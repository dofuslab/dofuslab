import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { config } from '@fortawesome/fontawesome-svg-core';
import { MediaContextProvider } from 'components/common/Media';
import Router from 'next/router';

import { appWithTranslation } from '../i18n';
import '@fortawesome/fontawesome-svg-core/styles.css';
import * as gtag from '../gtag';

Router.events.on('routeChangeComplete', url => gtag.pageview(url));
config.autoAddCss = false;

class DofusLabApp extends App<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
}> {
  render() {
    const { Component, pageProps, apolloClient } = this.props;

    return (
      <ApolloProvider client={apolloClient}>
        <MediaContextProvider>
          <Component {...pageProps} />
        </MediaContextProvider>
      </ApolloProvider>
    );
  }
}

export default withApollo(appWithTranslation(DofusLabApp));
