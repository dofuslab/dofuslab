/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';

import {
  customSet,
  customSet_equippedItems,
} from 'graphql/fragments/__generated__/customSet';
import {
  itemSlots,
  itemSlots_itemSlots,
} from 'graphql/queries/__generated__/itemSlots';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import DesktopEquippedItem from '../desktop/EquippedItem';
import MobileEquippedItem from '../mobile/EquippedItem';
import { mq } from 'common/constants';
import MageModal from './MageModal';
import { useSetModal } from 'common/utils';
import SetModal from './SetModal';
import { Media } from './Media';

interface IProps {
  customSet?: customSet | null;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  selectedItemSlotId: string | null;
  isMobile?: boolean;
}

const EquipmentSlots: React.FC<IProps> = ({
  customSet,
  selectItemSlot,
  selectedItemSlotId,
  isMobile,
}) => {
  const { data } = useQuery<itemSlots>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const equippedItemsBySlotId: {
    [key: string]: customSet_customSetById_equippedItems;
  } =
    customSet?.equippedItems.reduce(
      (acc, curr) => ({ ...acc, [curr.slot?.id]: curr }),
      {},
    ) ?? {};

  const [mageModalVisible, setMageModalVisible] = React.useState(false);
  const [
    equippedItem,
    setEquippedItem,
  ] = React.useState<customSet_equippedItems | null>(null);
  const openMageModal = React.useCallback(
    equippedItem => {
      setEquippedItem(equippedItem);
      setMageModalVisible(true);
    },
    [setMageModalVisible],
  );
  const closeMageModal = React.useCallback(() => {
    setMageModalVisible(false);
  }, [setMageModalVisible]);

  const {
    setModalVisible,
    selectedSet,
    openSetModal,
    closeSetModal,
  } = useSetModal();

  return (
    <div
      css={{
        display: 'grid',
        gridGap: 12,
        gridTemplateColumns: '1fr 1fr 1fr',
        [mq[0]]: {
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
        },
        [mq[1]]: {
          display: 'flex',
          flexWrap: 'wrap',
          margin: '0 8px',
        },
        [mq[4]]: {
          margin: '0 12px',
        },
      }}
    >
      {itemSlots?.map(slot => (
        <React.Fragment key={slot.id}>
          <Media lessThan="xs">
            <MobileEquippedItem
              slot={slot}
              key={slot.id}
              equippedItem={equippedItemsBySlotId[slot.id]}
              selected={selectedItemSlotId === slot.id}
              customSet={customSet}
              openMageModal={openMageModal}
              openSetModal={openSetModal}
            />
          </Media>
          <Media greaterThanOrEqual="xs">
            <DesktopEquippedItem
              slot={slot}
              key={slot.id}
              equippedItem={equippedItemsBySlotId[slot.id]}
              selected={selectedItemSlotId === slot.id}
              selectItemSlot={selectItemSlot}
              customSet={customSet}
              openMageModal={openMageModal}
              openSetModal={openSetModal}
            />
          </Media>
        </React.Fragment>
      ))}
      {customSet && equippedItem && (
        <MageModal
          visible={mageModalVisible}
          equippedItem={equippedItem}
          closeMageModal={closeMageModal}
          key={`${equippedItem.id}-${equippedItem.item.id}-${equippedItem.exos.length}`}
          customSetId={customSet.id}
        />
      )}
      {selectedSet && (
        <SetModal
          setId={selectedSet.id}
          setName={selectedSet.name}
          visible={setModalVisible}
          onCancel={closeSetModal}
          customSet={customSet}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default EquipmentSlots;
