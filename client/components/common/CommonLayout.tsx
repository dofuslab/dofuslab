import React from 'react';

import MobileLayout from 'components/mobile/Layout';
import DesktopLayout from 'components/desktop/Layout';
import { Media } from './Media';

interface Props {
  children: React.ReactNode;
}

const CommonLayout: React.FC<Props> = ({ children }) => (
  <>
    <Media lessThan="xs">
      <MobileLayout>{children}</MobileLayout>
    </Media>
    <Media greaterThanOrEqual="xs">
      <DesktopLayout>{children}</DesktopLayout>
    </Media>
  </>
);

export default CommonLayout;
