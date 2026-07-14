// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BuildDiscoveryDesktopNavigation,
  buildDiscoveryMobileMenuItem,
} from './BuildDiscoveryNavigation';

vi.mock('components/common/Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('antd', () => ({
  Button: ({
    children,
    href,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    'aria-label': string;
  }) => (
    <a href={href} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="search-icon" />,
}));
vi.mock('@fortawesome/free-solid-svg-icons', () => ({ faSearch: {} }));
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('Build Discovery navigation visibility', () => {
  afterEach(cleanup);

  it.each([false, true])('matches the desktop gate state %s', (enabled) => {
    render(
      <BuildDiscoveryDesktopNavigation
        enabled={enabled}
        label="Build Discovery"
      />,
    );
    expect(screen.queryByLabelText('Build Discovery') !== null).toBe(enabled);
  });

  it.each([false, true])('matches the mobile gate state %s', (enabled) => {
    const item = buildDiscoveryMobileMenuItem(enabled, 'Build Discovery', {});
    render(item?.label || null);
    expect(screen.queryByText('Build Discovery') !== null).toBe(enabled);
    expect(item?.key).toBe(enabled ? 'build-discovery' : undefined);
  });
});
