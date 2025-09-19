import { useRef } from 'react';
import { InMemoryCache, ApolloClient } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';
import { from } from '@apollo/client/link/core';
import { HttpLink } from '@apollo/client/link/http';
import { onError } from '@apollo/client/link/error';
import { NextPage } from 'next';
import { notification } from 'antd';
import { IncomingHttpHeaders } from 'http';
import { relayStylePagination } from '@apollo/client/utilities';
import { useRouter } from 'next/router';
import { GraphQLError } from 'graphql/error/GraphQLError';

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

const errorLink = onError(
  ({
    graphQLErrors,
    networkError,
  }: {
    graphQLErrors?: readonly GraphQLError[];
    networkError?: Error;
  }) => {
    if (networkError && process.browser) {
      notification.error({ message: networkError.message });
    }
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message }: { message: string }) => {
        if (process.browser) {
          notification.error({ message });
        }
      });
    }
  },
);

const getHttpLink = (headers?: IncomingHttpHeaders) =>
  new HttpLink({
    uri:
      typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_GRAPHQL_URI_FOR_CODEGEN ??
          process.env.NEXT_PUBLIC_GRAPHQL_URI
        : process.env.NEXT_PUBLIC_GRAPHQL_URI ?? process.env.GRAPHQL_URI,
    credentials: 'include',
    headers,
  });

const getLink = (headers?: IncomingHttpHeaders) =>
  from([errorLink, getHttpLink(headers)]);

export function createApolloClient(
  initialState: NormalizedCacheObject,
  headers?: IncomingHttpHeaders,
  ssrMode?: boolean,
) {
  return new ApolloClient<NormalizedCacheObject>({
    cache: new InMemoryCache({
      typePolicies: {
        CustomSet: {
          fields: {
            tagAssociations: {
              merge(_ignored: unknown, incoming: unknown) {
                return incoming;
              },
            },
          },
        },
        EquippedItem: {
          fields: {
            exos: {
              merge(_ignored: unknown, incoming: unknown) {
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
    link: getLink(headers),
    ssrMode,
  });
}

const initApollo = (
  initialState: NormalizedCacheObject,
  headers: IncomingHttpHeaders,
) => {
  if (typeof window === 'undefined') {
    return createApolloClient(initialState, headers);
  }

  if (!apolloClient) {
    apolloClient = createApolloClient(initialState, headers);
  }

  return apolloClient;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (App: NextPage<any>) =>
  function withApollo(props: {
    pageProps: { apolloState: Record<string, NormalizedCacheObject> };
    headers?: IncomingHttpHeaders;
  }) {
    const headers = props.headers || {};

    const router = useRouter();
    headers['accept-language'] = router.locale;

    const client = useRef<ApolloClient<NormalizedCacheObject>>(
      initApollo(props.pageProps.apolloState, headers),
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <App apolloClient={client.current} {...props} />;
  };
