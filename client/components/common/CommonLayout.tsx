import React from 'react';

import MobileLayout from 'components/mobile/Layout';
import DesktopLayout from 'components/desktop/Layout';
import { Media } from './Media';

interface Props {
  children: React.ReactNode;
  showSwitch: boolean;
}

const CommonLayout = ({ children, showSwitch }: Props) => (
  <>
    <Media lessThan="xs">
      <MobileLayout>{children}</MobileLayout>
    </Media>
    <Media greaterThanOrEqual="xs">
      <DesktopLayout showSwitch={showSwitch}>{children}</DesktopLayout>
    </Media>
  </>
);

export default CommonLayout;
