/* eslint-disable */

import React from 'react';
import { getDataFromTree } from '@apollo/client/react/ssr';
import {
  InMemoryCache,
  NormalizedCacheObject,
  ApolloClient,
  from,
  HttpLink,
} from '@apollo/client';

import { onError } from '@apollo/client/link/error';
import { NextPage, NextPageContext } from 'next';
import Head from 'next/head';
import { notification } from 'antd';
import { IncomingHttpHeaders } from 'http';
import { AppContext } from 'next/app';
import { relayStylePagination } from '@apollo/client/utilities';

interface ExtendedAppContext extends AppContext {
  ctx: NextPageContext & { apolloClient: ApolloClient<NormalizedCacheObject> };
}

interface Props {
  apolloState: any;
  headers: IncomingHttpHeaders;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError && process.browser) {
    notification.error({ message: networkError.message });
  }
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (process.browser) {
        notification.error({ message });
      }
    });
  }
});

const getHttpLink = (headers: IncomingHttpHeaders) =>
  new HttpLink({
    uri: process.env.GRAPHQL_URI,
    credentials: 'include',
    headers,
  });

function create(initialState: any, headers: IncomingHttpHeaders) {
  return new ApolloClient<NormalizedCacheObject>({
    cache: new InMemoryCache({
      typePolicies: {
        CustomSet: {
          fields: {
            tags: {
              merge(_ignored, incoming) {
                return incoming;
              },
            },
          },
        },
        User: {
          fields: {
            customSets: relayStylePagination(['filters']),
          },
        },
        Query: {
          fields: {
            items: relayStylePagination(['filters']),
            sets: relayStylePagination(['filters']),
          },
        },
      },
    }).restore(initialState || {}),
    link: from([errorLink, getHttpLink(headers)]),
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

export default (App: NextPage<any>) =>
  class withApollo extends React.Component<Props> {
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
      if (res && res.writableEnded) {
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
