import React from 'react';
import { getDataFromTree } from '@apollo/react-ssr';
import ApolloClient, {
  InMemoryCache,
  NormalizedCacheObject,
} from 'apollo-boost';
import { NextPage, NextPageContext } from 'next';
import Head from 'next/head';
import { notification } from 'antd';
import { IncomingHttpHeaders } from 'http';
import fetch from 'isomorphic-unfetch';
import { AppContext } from 'next/app';

interface ExtendedAppContext extends AppContext {
  ctx: NextPageContext & { apolloClient: ApolloClient<NormalizedCacheObject> };
}

interface IProps {
  apolloState: any;
  headers: IncomingHttpHeaders;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function create(initialState: any, headers: IncomingHttpHeaders) {
  return new ApolloClient<NormalizedCacheObject>({
    credentials: 'include',
    uri: process.env.GRAPHQL_URI,
    cache: new InMemoryCache().restore(initialState || {}),
    headers,
    fetch,
    onError: ({ graphQLErrors, networkError }) => {
      if (networkError) {
        notification.error({ message: networkError.message });
      }
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message }) => {
          notification.error({ message });
        });
      }
    },
  });
}

const initApollo = (initialState: any, headers: IncomingHttpHeaders) => {
  if (typeof window === 'undefined') {
    return create(initialState, headers);
  }

  if (!apolloClient) {
    apolloClient = create(initialState, headers);
  }

  return apolloClient;
};

export default (App: NextPage<any>) => {
  return class withApollo extends React.Component<IProps> {
    static displayName = `withApollo(${App.displayName})`;
    static defaultProps = { apolloState: {} };
    static async getInitialProps(ctx: ExtendedAppContext) {
      const {
        AppTree,
        ctx: { req, res },
      } = ctx;

      const headers = req ? req.headers : {};
      const apollo = initApollo({}, headers);
      ctx.ctx.apolloClient = apollo;

      let pageProps = {};
      if (App.getInitialProps) {
        try {
          pageProps = await App.getInitialProps(ctx as any);
        } catch (err) {
          console.error(err);
        }
      }
      if (res && res.finished) {
        return {};
      }
      if (typeof window === 'undefined') {
        try {
          await getDataFromTree(
            <AppTree pageProps={pageProps} apolloClient={apollo} />,
          );
        } catch (err) {
          console.error('Error while running `getDataFromTree`', err);
        }
        Head.rewind();
      }
      const apolloState = apollo.cache.extract();
      return {
        ...pageProps,
        headers,
        apolloState,
      };
    }

    apolloClient = initApollo(this.props.apolloState, this.props.headers);

    render() {
      return <App apolloClient={this.apolloClient} {...this.props} />;
    }
  };
};
