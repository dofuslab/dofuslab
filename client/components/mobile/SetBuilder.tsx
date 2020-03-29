/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import Layout from './Layout';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import Home from './Home';

interface IProps {
  customSet: customSet | null;
}

const SetBuilder: React.FC<IProps> = ({ customSet }) => {
  const [
    selectedItemSlot,
    selectItemSlot,
  ] = React.useState<itemSlots_itemSlots | null>(null);

  return (
    <Layout>
      <Home
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlot={selectedItemSlot}
      />
    </Layout>
  );
};

export default SetBuilder;
