/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import Layout from './Layout';
import Home from './Home';

interface Props {
  customSet: customSet | null;
}

const SetBuilder: React.FC<Props> = ({ customSet }) => {
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
