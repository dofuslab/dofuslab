/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import EquipPage from 'components/common/EquipPage';
import { useRouter } from 'next/router';

const EquipWithCustomSetPage: NextPage = () => {
  const router = useRouter();
  const customSetId = Array.isArray(router.query.customSetId)
    ? router.query.customSetId[0]
    : router.query.customSetId;
  return <EquipPage customSetId={customSetId} />;
};

EquipWithCustomSetPage.getInitialProps = async () => {
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

export default EquipWithCustomSetPage;
