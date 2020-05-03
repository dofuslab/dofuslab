/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import groupBy from 'lodash/groupBy';

import { itemSlots as ItemSlotsQueryType } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import { mq } from 'common/constants';
import { useSetModal } from 'common/utils';
import { BuildError } from 'common/types';
import { ItemSlot, CustomSet, EquippedItem } from 'common/type-aliases';
import DesktopEquippedItem from './EquippedItem';
import MageModal from '../common/MageModal';
import SetModal from '../common/SetModal';

interface Props {
  customSet?: CustomSet | null;
  selectItemSlot: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  selectedItemSlotId: string | null;
  isMobile?: boolean;
  errors: Array<BuildError>;
}

const ClassicEquipmentSlots: React.FC<Props> = ({
  customSet,
  selectItemSlot,
  selectedItemSlotId,
  isMobile,
  errors,
}) => {
  const { data } = useQuery<ItemSlotsQueryType>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const equippedItemsBySlotId: {
    [key: string]: EquippedItem;
  } =
    customSet?.equippedItems.reduce(
      (acc, curr) => ({ ...acc, [curr.slot?.id]: curr }),
      {},
    ) ?? {};

  const [mageModalVisible, setMageModalVisible] = React.useState(false);
  const [equippedItem, setEquippedItem] = React.useState<EquippedItem | null>(
    null,
  );
  const openMageModal = React.useCallback(
    (ei) => {
      setEquippedItem(ei);
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

  const groupedErrors = groupBy(errors, ({ equippedItem: ei }) => ei.id);

  return (
    <div
      css={{
        display: 'grid',
        gridGap: 12,
        gridTemplateColumns: 'repeat(6, 72px)',
        gridTemplateRows: 'repeat(6, 72px)',
        [mq[4]]: {
          gridTemplateColumns: 'repeat(6, 84px)',
          gridTemplateRows: 'repeat(6, 84px)',
        },
        flexShrink: 0,
      }}
    >
      {itemSlots?.map((slot) => {
        const ei: EquippedItem | undefined = equippedItemsBySlotId[slot.id];
        const equippedItemErrors: Array<BuildError> | undefined =
          groupedErrors[ei?.id];
        return (
          <div
            key={`slot-${slot.id}`}
            css={{
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: 80,
              [mq[4]]: { maxWidth: 100 },
            }}
          >
            <DesktopEquippedItem
              slot={slot}
              key={slot.id}
              equippedItem={ei}
              selected={selectedItemSlotId === slot.id}
              selectItemSlot={selectItemSlot}
              customSet={customSet}
              openMageModal={openMageModal}
              openSetModal={openSetModal}
              errors={equippedItemErrors}
            />
          </div>
        );
      })}
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

export default ClassicEquipmentSlots;
