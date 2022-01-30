import React from 'react';
import { useQuery } from '@apollo/client';

import CustomSetQuery from 'graphql/queries/customSet.graphql';
import Layout from 'components/mobile/Layout';
import { useRouter } from 'next/router';
import {
  customSet as customSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';

import EquippedItemCard from 'components/mobile/EquippedItemCard';
import ErrorPage from 'pages/_error';
import MageModal from 'components/common/MageModal';
import SetModal from 'components/common/SetModal';
import { mediaStyles } from 'components/common/Media';
import Head from 'next/head';
import { getErrors, getStatsFromCustomSet } from 'common/utils';
import { BuildError } from 'common/types';
import { CustomSetHead } from 'common/wrappers';
import { ItemSet } from 'common/type-aliases';

const EquippedItemView: React.FC = () => {
  const router = useRouter();
  const { customSetId, equippedItemId } = router.query;

  const { data: customSetData } = useQuery<
    customSetQueryType,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const [setModalVisible, setSetModalVisible] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState<ItemSet | null>(null);

  const openSetModal = React.useCallback(
    (set: ItemSet) => {
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
    (ei) => ei.id === equippedItemId,
  );

  if (!equippedItem) {
    return <ErrorPage statusCode={404} />;
  }

  const statsFromCustomSet = getStatsFromCustomSet(customSet);

  let errors: Array<BuildError> = [];

  if (statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  const equippedItemErrors = errors.filter(
    ({ equippedItem: ei }) => ei.id === equippedItem?.id,
  );

  return (
    <Layout>
      <Head>
        <style
          type="text/css"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
      </Head>
      <CustomSetHead customSet={customSet} />
      <EquippedItemCard
        equippedItem={equippedItem}
        customSet={customSet}
        itemSlot={equippedItem.slot}
        openSetModal={openSetModal}
        openMageModal={openMageModal}
        errors={equippedItemErrors}
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
          shouldRedirect
        />
      )}
    </Layout>
  );
};

export default EquippedItemView;
