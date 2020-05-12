/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import EquipPage from 'components/common/EquipPage';

const EquipIndexPage: NextPage = () => <EquipPage customSetId={null} />;

EquipIndexPage.getInitialProps = async () => {
  return {
    namespacesRequired: [
      'common',
      'stat',
      'auth',
      'weapon_spell_effect',
      'status',
      'mage',
    ],
  };
};

export default EquipIndexPage;
