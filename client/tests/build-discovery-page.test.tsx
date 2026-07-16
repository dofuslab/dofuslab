// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BuildDiscoveryPage from 'pages/build-discovery';

let gate = { enabled: false, loading: false };

vi.mock('common/statsig', () => ({
  useBuildDiscoveryGate: () => gate,
}));
vi.mock('components/common/BuildDiscoveryPage', () => ({
  default: () => <div>discovery-content</div>,
}));
vi.mock('components/common/CommonLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('components/common/Media', () => ({ mediaStyles: '' }));
vi.mock('common/i18n-utils', () => ({ DEFAULT_LANGUAGE: 'en' }));
vi.mock('common/utils', () => ({ getTitle: (title: string) => title }));
vi.mock('pages/_error', () => ({
  default: ({ statusCode }: { statusCode: number }) => (
    <div>{`error-${statusCode}`}</div>
  ),
}));
vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn(),
}));

describe('Build Discovery direct route', () => {
  afterEach(cleanup);

  it('renders nothing while the gate is loading', () => {
    gate = { enabled: false, loading: true };
    const { container } = render(<BuildDiscoveryPage />);
    expect(container.innerHTML).toBe('');
  });

  it('denies direct navigation when disabled', () => {
    gate = { enabled: false, loading: false };
    render(<BuildDiscoveryPage />);
    expect(screen.getByText('error-404')).toBeTruthy();
  });

  it('renders the feature when enabled', () => {
    gate = { enabled: true, loading: false };
    render(<BuildDiscoveryPage />);
    expect(screen.getByText('discovery-content')).toBeTruthy();
  });
});
