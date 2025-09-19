import { useReducer, useMemo, useEffect } from 'react';
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
import '@ant-design/v5-patch-for-react-19';

import Head from 'next/head';
import { App, ConfigProvider, notification, theme } from 'antd';
import NotificationContext from 'common/notificationContext';

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

  const [appliedBuffs, dispatch] = useReducer(appliedBuffsReducer, []);

  const statsFromCustomSet = useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const statsFromAppliedBuffs = useMemo(
    () => getStatsFromAppliedBuffs(appliedBuffs),
    [appliedBuffs],
  );

  const statsFromCustomSetWithBuffs = useMemo(
    () => combineStatsWithBuffs(statsFromCustomSet, statsFromAppliedBuffs),
    [statsFromCustomSet, statsFromAppliedBuffs],
  );

  useEffect(() => {
    dispatch({ type: AppliedBuffActionType.CLEAR_ALL });
  }, [customSetId]);

  const [api, contextHolder] = notification.useNotification();

  const notificationContextValue = useMemo(() => api, [api]);

  const customSetContextValue = useMemo(
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
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
            }}
          >
            <App>
              <CustomSetContext.Provider value={customSetContextValue}>
                <NotificationContext.Provider value={notificationContextValue}>
                  <Head>
                    <meta
                      name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                    />
                  </Head>
                  {contextHolder}
                  <Component {...pageProps} />
                </NotificationContext.Provider>
              </CustomSetContext.Provider>
            </App>
          </ConfigProvider>
        </ThemeProvider>
      </MediaContextProvider>
    </ApolloProvider>
  );
};

export default withApollo(appWithTranslation(DofusLabApp));
