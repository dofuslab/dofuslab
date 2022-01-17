import React from 'react';
import { NextPage } from 'next';

import { EditableContext } from 'common/utils';
import EquippedItemView from 'components/mobile/EquippedItemView';

const EquippedItemPageReadonly: NextPage = () => {
  return (
    <EditableContext.Provider value={false}>
      <EquippedItemView />
    </EditableContext.Provider>
  );
};

EquippedItemPageReadonly.getInitialProps = async () => {
  return {
    namespacesRequired: [
      'common',
      'stat',
      'auth',
      'weapon_spell_effect',
      'status',
      'mage',
      'keyboard_shortcuts',
    ],
  };
};

export default EquippedItemPageReadonly;
