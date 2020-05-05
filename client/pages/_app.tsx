import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { config } from '@fortawesome/fontawesome-svg-core';
import { MediaContextProvider } from 'components/common/Media';
import Router from 'next/router';
import { ThemeProvider } from 'emotion-theming';

import { appWithTranslation } from '../i18n';
import '@fortawesome/fontawesome-svg-core/styles.css';
import * as gtag from '../gtag';
import { darkTheme } from 'common/themes';

Router.events.on('routeChangeComplete', (url) => gtag.pageview(url));
config.autoAddCss = false;

class DofusLabApp extends App<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
}> {
  state = {
    theme: darkTheme,
  };

  // dynamic seems to load the CSS unconditionally
  // https://github.com/zeit/next-plugins/issues/444
  // componentDidMount() {
  //   if (window.localStorage.getItem('theme') === darkTheme.name) {
  //     dynamic(() => {
  //       return import('../styles/dark-mode.less');
  //     });
  //     this.setState({ theme: darkTheme });
  //   }
  // }

  render() {
    const { Component, pageProps, apolloClient } = this.props;

    return (
      <ApolloProvider client={apolloClient}>
        <MediaContextProvider>
          <ThemeProvider theme={this.state.theme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </MediaContextProvider>
      </ApolloProvider>
    );
  }
}

export default withApollo(appWithTranslation(DofusLabApp));
