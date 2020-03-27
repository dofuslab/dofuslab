/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { mediaStyles } from 'components/common/Media';
import Selector from 'components/common/Selector';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ErrorPage from 'pages/_error';
import Layout from 'components/common/Layout';

const EquipPage: NextPage = () => {
  const router = useRouter();
  const { itemSlotId, customSetId } = router.query;

  const { data } = useQuery<itemSlots>(ItemSlotsQuery);
  const itemSlot = data?.itemSlots.find(slot => slot.id === itemSlotId);

  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: customSetId }, skip: !customSetId },
  );

  const customSet = customSetData?.customSetById;

  if (!itemSlot) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout>
      <Head>
        <style
          type="text/css"
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
        <title>DofusLab.io</title>
      </Head>
      <Selector
        customSet={customSet}
        selectedItemSlot={itemSlot}
        showSets={false}
        isMobile
      />
    </Layout>
  );
};

EquipPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'stat', 'auth', 'weapon_stat'],
  };
};

export default EquipPage;
