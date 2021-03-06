import React from 'react';
import { NextPage } from 'next';

import { EditableContext } from 'common/utils';
import EquippedItemView from 'components/mobile/EquippedItemView';

const EquippedItemPage: NextPage = () => {
  return (
    <EditableContext.Provider value>
      <EquippedItemView />
    </EditableContext.Provider>
  );
};

EquippedItemPage.getInitialProps = async () => {
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

export default EquippedItemPage;
