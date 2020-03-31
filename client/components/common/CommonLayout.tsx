import React from 'react';
import { Media } from './Media';

import MobileLayout from 'components/mobile/Layout';
import DesktopLayout from 'components/desktop/Layout';

interface IProps {
  children: React.ReactNode;
}

const CommonLayout: React.FC<IProps> = ({ children }) => {
  return (
    <>
      <Media lessThan={'xs'}>
        <MobileLayout>{children}</MobileLayout>
      </Media>
      <Media greaterThanOrEqual={'xs'}>
        <DesktopLayout>{children}</DesktopLayout>
      </Media>
    </>
  );
};

export default CommonLayout;
