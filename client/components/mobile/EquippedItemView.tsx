import { useState, useCallback } from 'react';
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

const EquippedItemView = () => {
  const router = useRouter();
  const { customSetId, equippedItemId } = router.query;

  const { data: customSetData } = useQuery<
    customSetQueryType,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const [setModalOpen, setSetModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<ItemSet | null>(null);

  const openSetModal = useCallback(
    (set: ItemSet) => {
      setSelectedSet(set);
      setSetModalOpen(true);
    },
    [setSelectedSet, setSetModalOpen],
  );

  const closeSetModal = useCallback(() => {
    setSetModalOpen(false);
  }, [setSetModalOpen]);

  const [mageModalOpen, setMageModalOpen] = useState(false);

  const openMageModal = useCallback(() => {
    setMageModalOpen(true);
  }, [setMageModalOpen]);
  const closeMageModal = useCallback(() => {
    setMageModalOpen(false);
  }, [setMageModalOpen]);

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
        open={mageModalOpen}
        equippedItem={equippedItem}
        closeMageModal={closeMageModal}
        key={`${equippedItem.id}-${equippedItem.item.id}-${equippedItem.exos.length}`}
        customSetId={customSet.id}
      />
      {selectedSet && (
        <SetModal
          open={setModalOpen}
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
