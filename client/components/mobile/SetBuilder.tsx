/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { CustomSet, ItemSlot } from 'common/type-aliases';
import Layout from './Layout';
import Home from './Home';

interface Props {
  customSet: CustomSet | null;
}

const SetBuilder: React.FC<Props> = ({ customSet }) => {
  const [selectedItemSlot, selectItemSlot] = React.useState<ItemSlot | null>(
    null,
  );

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
