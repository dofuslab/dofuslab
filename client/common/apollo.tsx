import React from 'react';
import {
  InMemoryCache,
  NormalizedCacheObject,
  ApolloClient,
  from,
  HttpLink,
  ApolloLink,
} from '@apollo/client';

import { onError } from '@apollo/client/link/error';
import { NextPage } from 'next';
import { notification } from 'antd';
import { IncomingHttpHeaders } from 'http';
import { Observable, relayStylePagination } from '@apollo/client/utilities';
import { useRouter } from 'next/router';

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

const getHttpLink = (headers?: IncomingHttpHeaders) =>
  new HttpLink({
    uri: process.env.GRAPHQL_URI,
    credentials: 'include',
    headers,
  });

const indexedDbLink = new ApolloLink((operation) => {
  console.log({ operation });

  return new Observable((observer) => {
    observer.next({
      data: {
        items: {
          edges: [],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjIz',
            hasNextPage: true,
            __typename: 'PageInfo',
          },
          __typename: 'ItemConnection',
        },
        itemSuggestions: [],
      },
    });
    observer.complete();
  });
});

const getDirectionalLink = (headers?: IncomingHttpHeaders) =>
  errorLink.split(
    (operation) => operation.operationName === 'items',
    indexedDbLink,
    getHttpLink(headers),
  );

const getLink = (headers?: IncomingHttpHeaders) =>
  from([errorLink, getDirectionalLink(headers)]);

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
              merge(_ignored, incoming) {
                return incoming;
              },
            },
          },
        },
        EquippedItem: {
          fields: {
            exos: {
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
          queryType: true,
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

    const client = React.useRef<ApolloClient<NormalizedCacheObject>>(
      initApollo(props.pageProps.apolloState, headers),
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <App apolloClient={client.current} {...props} />;
  };
