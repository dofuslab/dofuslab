import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useQuery } from '@apollo/client';
import {
  LogLevel,
  StatsigProvider,
  useStatsigClient,
  useStatsigUser,
} from '@statsig/react-bindings';

import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { currentUser as CurrentUserQuery } from 'graphql/queries/__generated__/currentUser';

export const BUILD_DISCOVERY_GATE = 'build_generator_beta';

interface StatsigState {
  configured: boolean;
  identityReady: boolean;
}

const StatsigStateContext = createContext<StatsigState>({
  configured: false,
  identityReady: true,
});

interface Props {
  children: ReactNode;
}

const StatsigIdentity = ({ children }: Props) => {
  const { data, loading } = useQuery<CurrentUserQuery>(currentUserQuery);
  const { user, updateUserAsync } = useStatsigUser();
  const userId = data?.currentUser?.id
    ? String(data.currentUser.id)
    : undefined;
  const username = data?.currentUser?.username;
  const statsigUsername = user.privateAttributes?.username;
  const identityReady =
    !loading && user.userID === userId && statsigUsername === username;
  const statsigState = useMemo(
    () => ({ configured: true, identityReady }),
    [identityReady],
  );

  useEffect(() => {
    if (loading || (user.userID === userId && statsigUsername === username)) {
      return;
    }

    updateUserAsync(
      userId ? { userID: userId, privateAttributes: { username } } : {},
    ).catch(() => undefined);
  }, [
    loading,
    statsigUsername,
    updateUserAsync,
    user.userID,
    userId,
    username,
  ]);

  return (
    <StatsigStateContext.Provider value={statsigState}>
      {children}
    </StatsigStateContext.Provider>
  );
};

export const DofusLabStatsigProvider = ({ children }: Props) => {
  const clientKey = process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;
  const environmentTier =
    process.env.NEXT_PUBLIC_STATSIG_ENVIRONMENT_TIER ||
    (process.env.NODE_ENV === 'production' ? 'production' : 'development');

  if (!clientKey) {
    return children;
  }

  return (
    <StatsigProvider
      sdkKey={clientKey}
      user={{}}
      options={{
        environment: { tier: environmentTier },
        logLevel:
          process.env.NODE_ENV === 'production'
            ? LogLevel.Warn
            : LogLevel.Debug,
      }}
    >
      <StatsigIdentity>{children}</StatsigIdentity>
    </StatsigProvider>
  );
};

export const useBuildDiscoveryGate = () => {
  const { configured, identityReady } = useContext(StatsigStateContext);
  const { checkGate, isLoading } = useStatsigClient();

  if (!configured) {
    return { enabled: false, loading: false };
  }

  const loading = !identityReady || isLoading;

  return {
    enabled: !loading && checkGate(BUILD_DISCOVERY_GATE),
    loading,
  };
};
