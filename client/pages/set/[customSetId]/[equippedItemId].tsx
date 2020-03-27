import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { NextPage } from 'next';

import CustomSetQuery from 'graphql/queries/customSet.graphql';
import Layout from 'components/common/Layout';
import { useRouter } from 'next/router';
import { customSet } from 'graphql/queries/__generated__/customSet';
import { customSetVariables } from 'graphql/queries/__generated__/customSet';
import EquippedItemCard from 'components/mobile/EquippedItemCard';
import ErrorPage from 'pages/_error';
import { item_set } from 'graphql/fragments/__generated__/item';
import MageModal from 'components/common/MageModal';
import SetModal from 'components/common/SetModal';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';

const EquippedItemPage: NextPage = () => {
  const router = useRouter();
  const { customSetId, equippedItemId } = router.query;

  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: customSetId }, skip: !customSetId },
  );

  const [setModalVisible, setSetModalVisible] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState<item_set | null>(null);

  const openSetModal = React.useCallback(
    (set: item_set) => {
      setSelectedSet(set);
      setSetModalVisible(true);
    },
    [setSelectedSet, setSetModalVisible],
  );

  const closeSetModal = React.useCallback(() => {
    setSetModalVisible(false);
  }, [setSetModalVisible]);

  const [mageModalVisible, setMageModalVisible] = React.useState(false);

  const openMageModal = React.useCallback(() => {
    setMageModalVisible(true);
  }, [setMageModalVisible]);
  const closeMageModal = React.useCallback(() => {
    setMageModalVisible(false);
  }, [setMageModalVisible]);

  const customSet = customSetData?.customSetById;

  if (!customSet) {
    return <ErrorPage statusCode={404} />;
  }

  const equippedItem = customSet?.equippedItems.find(
    equippedItem => equippedItem.id === equippedItemId,
  );

  if (!equippedItem) {
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
      <EquippedItemCard
        equippedItem={equippedItem}
        customSet={customSet}
        itemSlotId={equippedItem.slot.id}
        openSetModal={openSetModal}
        openMageModal={openMageModal}
      />
      <MageModal
        visible={mageModalVisible}
        equippedItem={equippedItem}
        closeMageModal={closeMageModal}
        key={`${equippedItem.id}-${equippedItem.item.id}-${equippedItem.exos.length}`}
        customSetId={customSet.id}
      />
      {selectedSet && (
        <SetModal
          visible={setModalVisible}
          setId={selectedSet.id}
          setName={selectedSet.name}
          onCancel={closeSetModal}
          customSet={customSet}
          isMobile
        />
      )}
    </Layout>
  );
};

EquippedItemPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'stat', 'auth', 'weapon_stat'],
  };
};

export default EquippedItemPage;
