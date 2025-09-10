import React from 'react';
import { AppProps } from 'next/app';
import {
  ApolloProvider,
  useQuery,
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client';
import withApollo from 'common/apollo';
import { config } from '@fortawesome/fontawesome-svg-core';
import { MediaContextProvider } from 'components/common/Media';
import Router, { useRouter } from 'next/router';
import { ThemeProvider } from '@emotion/react';

import CustomSetQuery from 'graphql/queries/customSet.graphql';
import {
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import { darkTheme } from 'common/themes';
import { appWithTranslation } from 'next-i18next';
import * as gtag from 'gtag';
import {
  appliedBuffsReducer,
  getStatsFromCustomSet,
  getStatsFromAppliedBuffs,
  combineStatsWithBuffs,
  CustomSetContext,
} from 'common/utils';
import { AppliedBuffActionType } from 'common/types';

import '@fortawesome/fontawesome-svg-core/styles.css';
import 'antd/dist/antd.dark.css';
import Head from 'next/head';
import loadItems from 'common/load-items';

Router.events.on('routeChangeComplete', (url) => gtag.pageview(url));
config.autoAddCss = false;

interface Props extends AppProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

const DofusLabApp = ({ Component, apolloClient, pageProps }: Props) => {
  const router = useRouter();
  const { customSetId } = router.query;

  const { data: customSetData, loading: customSetLoading } = useQuery<
    CustomSetQueryType,
    customSetVariables
  >(CustomSetQuery, {
    variables: { id: customSetId },
    skip: !customSetId,
    client: apolloClient,
  });

  const customSet = customSetData?.customSetById || null;

  const [appliedBuffs, dispatch] = React.useReducer(appliedBuffsReducer, []);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const statsFromAppliedBuffs = React.useMemo(
    () => getStatsFromAppliedBuffs(appliedBuffs),
    [appliedBuffs],
  );

  const statsFromCustomSetWithBuffs = React.useMemo(
    () => combineStatsWithBuffs(statsFromCustomSet, statsFromAppliedBuffs),
    [statsFromCustomSet, statsFromAppliedBuffs],
  );

  React.useEffect(() => {
    dispatch({ type: AppliedBuffActionType.CLEAR_ALL });
  }, [customSetId]);

  React.useEffect(() => {
    const worker = new Worker(
      new URL('../common/load-items.worker.js', import.meta.url),
      { type: 'module' },
    );
    worker.postMessage('mounted');
    return () => {
      worker.terminate();
    };
  }, []);

  const customSetContextValue = React.useMemo(
    () => ({
      dispatch,
      appliedBuffs,
      customSet,
      customSetLoading,
      statsFromCustomSet,
      statsFromAppliedBuffs,
      statsFromCustomSetWithBuffs,
    }),
    [
      dispatch,
      appliedBuffs,
      customSet,
      customSetLoading,
      statsFromCustomSet,
      statsFromAppliedBuffs,
      statsFromCustomSetWithBuffs,
    ],
  );

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ApolloProvider client={apolloClient}>
      <MediaContextProvider>
        <ThemeProvider theme={darkTheme}>
          <CustomSetContext.Provider value={customSetContextValue}>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
              />
            </Head>
            <Component {...pageProps} />
          </CustomSetContext.Provider>
        </ThemeProvider>
      </MediaContextProvider>
    </ApolloProvider>
  );
};

export default withApollo(appWithTranslation(DofusLabApp));
