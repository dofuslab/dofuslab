/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

import Layout from '../common/Layout';

import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import Home from './Home';

const SetBuilder: React.FC = () => {
  const router = useRouter();
  const { customSetId } = router.query;

  console.log(customSetId);

  const { data: customSetData, error, loading } = useQuery<
    customSet,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  console.log(customSetData, error, loading);

  const [
    selectedItemSlot,
    selectItemSlot,
  ] = React.useState<itemSlots_itemSlots | null>(null);

  return (
    <Layout>
      <Home
        customSet={customSetData?.customSetById}
        selectItemSlot={selectItemSlot}
        selectedItemSlot={selectedItemSlot}
      />
    </Layout>
  );
};

export default SetBuilder;
