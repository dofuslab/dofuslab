import React from 'react';
import { AppProps } from 'next/app';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import withApollo from 'common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { config } from '@fortawesome/fontawesome-svg-core';
import { MediaContextProvider } from 'components/common/Media';
import Router, { useRouter } from 'next/router';
import { ThemeProvider } from 'emotion-theming';

import CustomSetQuery from 'graphql/queries/customSet.graphql';
import {
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import { lightTheme } from 'common/themes';
import { appWithTranslation } from 'i18n';
import * as gtag from 'gtag';
import {
  appliedBuffsReducer,
  getStatsFromCustomSet,
  getStatsFromAppliedBuffs,
  combineStatsWithBuffs,
  CustomSetContext,
} from 'common/utils';
import { AppliedBuffActionType } from 'common/types';
import changeTheme from 'next-dynamic-antd-theme';

import '@fortawesome/fontawesome-svg-core/styles.css';

Router.events.on('routeChangeComplete', (url) => gtag.pageview(url));
config.autoAddCss = false;

interface Props extends AppProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

const DofusLabApp: React.FC<Props> = ({
  Component,
  apolloClient,
  pageProps,
}) => {
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

  React.useEffect(() => {
    setTimeout(() => {
      changeTheme('dark');
    }, 5000);
  });
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

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ApolloProvider client={apolloClient}>
      <MediaContextProvider>
        <ThemeProvider theme={lightTheme}>
          <CustomSetContext.Provider
            value={{
              dispatch,
              appliedBuffs,
              customSet,
              customSetLoading,
              statsFromCustomSet,
              statsFromAppliedBuffs,
              statsFromCustomSetWithBuffs,
            }}
          >
            <Component {...pageProps} />
          </CustomSetContext.Provider>
        </ThemeProvider>
      </MediaContextProvider>
    </ApolloProvider>
  );
};

export default withApollo(appWithTranslation(DofusLabApp));
