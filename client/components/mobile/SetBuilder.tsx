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
import Selector from '../common/Selector';
import { MobileScreen, mobileScreenTypes } from 'common/types';
import Home from './Home';
import EquippedItemCard from 'components/mobile/EquippedItemCard';
import { item_set } from 'graphql/fragments/__generated__/item';
import SetModal from 'components/common/SetModal';
import MageModal from 'components/common/MageModal';

const SetBuilder: React.FC = () => {
  const router = useRouter();
  const { id: setId } = router.query;

  const { data: customSetData } = useQuery<customSet, customSetVariables>(
    CustomSetQuery,
    { variables: { id: setId }, skip: !setId },
  );

  const [
    selectedItemSlot,
    selectItemSlot,
  ] = React.useState<itemSlots_itemSlots | null>(null);

  const [mobileScreen, setMobileScreen] = React.useState<MobileScreen>(
    mobileScreenTypes.HOME,
  );

  const customSet = customSetData?.customSetById;

  const equippedItem = customSet?.equippedItems.find(
    ({ slot: { id: slotId } }) => selectedItemSlot?.id === slotId,
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

  const windowNode = React.useRef<Window | null>(null);

  React.useEffect(() => {
    windowNode.current = window;
  });

  return (
    <Layout>
      {mobileScreen === mobileScreenTypes.HOME && (
        <Home
          customSet={customSetData?.customSetById}
          selectItemSlot={selectItemSlot}
          selectedItemSlot={selectedItemSlot}
          setMobileScreen={setMobileScreen}
        />
      )}
      {mobileScreen === mobileScreenTypes.EQUIPPED_ITEM &&
        equippedItem &&
        customSet &&
        selectedItemSlot && (
          <EquippedItemCard
            equippedItem={equippedItem}
            customSet={customSet}
            itemSlotId={selectedItemSlot.id}
            openSetModal={openSetModal}
            openMageModal={openMageModal}
            setMobileScreen={setMobileScreen}
            selectItemSlot={selectItemSlot}
          />
        )}
      {[
        mobileScreenTypes.ITEM_SELECTOR,
        mobileScreenTypes.SET_SELECTOR,
      ].includes(mobileScreen) && (
        <Selector
          key={`selected-item-slot-${selectedItemSlot?.id}-level-${
            customSet?.level
          }-${
            mobileScreen === mobileScreenTypes.SET_SELECTOR ? 'sets' : 'items'
          }`}
          customSet={customSetData?.customSetById}
          selectItemSlot={selectItemSlot}
          selectedItemSlot={selectedItemSlot}
          showSets={mobileScreen === mobileScreenTypes.SET_SELECTOR}
          setMobileScreen={setMobileScreen}
          windowNode={windowNode.current}
        />
      )}
      {customSetData?.customSetById && equippedItem && (
        <MageModal
          visible={mageModalVisible}
          equippedItem={equippedItem}
          closeMageModal={closeMageModal}
          key={`${equippedItem.id}-${equippedItem.item.id}-${equippedItem.exos.length}`}
          customSetId={customSet?.id}
        />
      )}
      {selectedSet && (
        <SetModal
          visible={setModalVisible}
          setId={selectedSet.id}
          setName={selectedSet.name}
          onCancel={closeSetModal}
        />
      )}
    </Layout>
  );
};

export default SetBuilder;
