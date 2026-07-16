// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BUILD_DISCOVERY_GATE,
  DofusLabStatsigProvider,
  useBuildDiscoveryGate,
} from './statsig';

type ApolloState = {
  data?: { currentUser: { id: string; username: string } | null };
  loading: boolean;
};

let apolloState: ApolloState;
let statsigUser: {
  userID?: string;
  privateAttributes?: { username?: string };
};
let statsigLoading: boolean;
const checkGate = vi.fn();
const updateUserAsync = vi.fn(() => Promise.resolve());

vi.mock('@apollo/client', () => ({
  useQuery: () => apolloState,
}));

vi.mock('@statsig/react-bindings', () => ({
  LogLevel: { Debug: 'debug', Warn: 'warn' },
  StatsigProvider: ({ children }: { children: React.ReactNode }) => children,
  useStatsigClient: () => ({ checkGate, isLoading: statsigLoading }),
  useStatsigUser: () => ({ user: statsigUser, updateUserAsync }),
}));

vi.mock('graphql/queries/currentUser.graphql', () => ({ default: {} }));

const GateProbe = () => {
  const gate = useBuildDiscoveryGate();
  return <div>{`${gate.loading}:${gate.enabled}`}</div>;
};

describe('Build Discovery Statsig boundary', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY = 'client-test-key';
    apolloState = { loading: false, data: { currentUser: null } };
    statsigUser = {};
    statsigLoading = false;
    checkGate.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    delete process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;
  });

  it('fails closed when the client key is missing', () => {
    delete process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;
    render(
      <DofusLabStatsigProvider>
        <GateProbe />
      </DofusLabStatsigProvider>,
    );

    expect(screen.getByText('false:false')).toBeTruthy();
    expect(checkGate).not.toHaveBeenCalled();
  });

  it('stays disabled while Apollo identity or Statsig is loading', () => {
    apolloState = { loading: true };
    statsigLoading = true;
    render(
      <DofusLabStatsigProvider>
        <GateProbe />
      </DofusLabStatsigProvider>,
    );

    expect(screen.getByText('true:false')).toBeTruthy();
    expect(checkGate).not.toHaveBeenCalled();
  });

  it('keeps the gate disabled for anonymous users', () => {
    checkGate.mockReturnValue(true);
    render(
      <DofusLabStatsigProvider>
        <GateProbe />
      </DofusLabStatsigProvider>,
    );

    expect(screen.getByText('false:false')).toBeTruthy();
    expect(checkGate).not.toHaveBeenCalled();
  });

  it.each([
    [false, 'false:false'],
    [true, 'false:true'],
  ])('reports a ready gate result of %s', (enabled, expected) => {
    const id = '3ccf19fd-e9cc-4a78-b80d-c9c46feee1b8';
    apolloState = {
      loading: false,
      data: { currentUser: { id, username: 'PrivateUser' } },
    };
    statsigUser = {
      userID: id,
      privateAttributes: { username: 'PrivateUser' },
    };
    checkGate.mockReturnValue(enabled);
    render(
      <DofusLabStatsigProvider>
        <GateProbe />
      </DofusLabStatsigProvider>,
    );

    expect(screen.getByText(expected)).toBeTruthy();
    expect(checkGate).toHaveBeenCalledWith(BUILD_DISCOVERY_GATE);
  });

  it('updates authenticated identity with UUID and private username', async () => {
    const id = '3ccf19fd-e9cc-4a78-b80d-c9c46feee1b8';
    apolloState = {
      loading: false,
      data: { currentUser: { id, username: 'PrivateUser' } },
    };
    render(
      <DofusLabStatsigProvider>
        <GateProbe />
      </DofusLabStatsigProvider>,
    );

    await waitFor(() =>
      expect(updateUserAsync).toHaveBeenCalledWith({
        userID: id,
        privateAttributes: { username: 'PrivateUser' },
      }),
    );
    expect(screen.getByText('true:false')).toBeTruthy();
  });
});
