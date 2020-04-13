import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import withApollo from 'common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { config } from '@fortawesome/fontawesome-svg-core';
import { MediaContextProvider } from 'components/common/Media';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'emotion-theming';

import { appWithTranslation } from '../i18n';
import '@fortawesome/fontawesome-svg-core/styles.css';
import * as gtag from '../gtag';
import { darkTheme, lightTheme } from 'common/themes';

Router.events.on('routeChangeComplete', url => gtag.pageview(url));
config.autoAddCss = false;

class DofusLabApp extends App<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
}> {
  state = {
    theme: lightTheme,
  };

  componentDidMount() {
    console.log('THEME');
    if (window.localStorage.getItem('theme') === darkTheme.name) {
      console.log('DARK THEME');
      dynamic(() => {
        console.log('dynamically importing');
        return import('../styles/wrapper');
      });
      this.setState({ theme: darkTheme });
    }
  }
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
