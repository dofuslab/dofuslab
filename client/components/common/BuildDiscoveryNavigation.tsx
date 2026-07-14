/** @jsxImportSource @emotion/react */

import { Button } from 'antd';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

import Tooltip from 'components/common/Tooltip';

interface NavigationProps {
  enabled: boolean;
  label: string;
}

export const BuildDiscoveryDesktopNavigation = ({
  enabled,
  label,
}: NavigationProps) => {
  if (!enabled) {
    return null;
  }

  return (
    <Tooltip placement="bottom" title={label}>
      <Button
        aria-label={label}
        href="/build-discovery"
        css={{ marginLeft: 12 }}
      >
        <FontAwesomeIcon icon={faSearch} />
      </Button>
    </Tooltip>
  );
};

export const buildDiscoveryMobileMenuItem = (
  enabled: boolean,
  label: string,
  iconWrapper: Record<string, string | number>,
) => {
  if (!enabled) {
    return null;
  }

  return {
    key: 'build-discovery',
    label: (
      <Link href="/build-discovery" as="/build-discovery">
        <span css={iconWrapper}>
          <FontAwesomeIcon icon={faSearch} />
        </span>
        {label}
      </Link>
    ),
  };
};
