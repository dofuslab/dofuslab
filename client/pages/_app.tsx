import React from 'react';
import { AppProps } from 'next/app';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import withApollo from 'common/apollo';
import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';
import { config } from '@fortawesome/fontawesome-svg-core';
import { MediaContextProvider } from 'components/common/Media';
import Router, { useRouter } from 'next/router';
import { ThemeProvider } from 'emotion-theming';
import Lockr from 'lockr';

import CustomSetQuery from 'graphql/queries/customSet.graphql';
import {
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import {
  lightTheme,
  darkTheme,
  LIGHT_THEME_NAME,
  DARK_THEME_NAME,
} from 'common/themes';
import { appWithTranslation } from 'i18n';
import * as gtag from 'gtag';
import {
  appliedBuffsReducer,
  getStatsFromCustomSet,
  getStatsFromAppliedBuffs,
  combineStatsWithBuffs,
  CustomSetContext,
  ThemeContext,
} from 'common/utils';
import { AppliedBuffActionType, Theme } from 'common/types';
import changeTheme from 'next-dynamic-antd-theme';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { THEME_STORAGE_KEY } from 'common/constants';

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

  const [theme, setTheme] = React.useState<Theme>(lightTheme);

  React.useEffect(() => {
    const localStorageValue = Lockr.get(THEME_STORAGE_KEY);
    if (localStorageValue === DARK_THEME_NAME) {
      setTheme(darkTheme);
    } else if (!localStorageValue) {
      const mqList = window.matchMedia('(prefers-color-scheme: dark)');
      const prefersDark = mqList.matches;
      if (prefersDark) {
        setTheme(darkTheme);
      }
    }
  }, []);

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
    Lockr.set(THEME_STORAGE_KEY, theme.name);
    if (theme.name === LIGHT_THEME_NAME) {
      changeTheme('default');
    } else {
      changeTheme('dark');
    }
  }, [theme]);

  React.useEffect(() => {
    dispatch({ type: AppliedBuffActionType.CLEAR_ALL });
  }, [customSetId]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ApolloProvider client={apolloClient}>
      <MediaContextProvider>
        <ThemeProvider theme={theme}>
          <ThemeContext.Provider value={{ setTheme }}>
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
          </ThemeContext.Provider>
        </ThemeProvider>
      </MediaContextProvider>
    </ApolloProvider>
  );
};

export default withApollo(appWithTranslation(DofusLabApp));
