/** @jsxImportSource @emotion/react */

import React from 'react';

import { useQuery } from '@apollo/client';
import groupBy from 'lodash/groupBy';

import { itemSlots as ItemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import { mq } from 'common/constants';
import { useSetModal } from 'common/utils';
import { BuildError } from 'common/types';
import { EquippedItem, CustomSet, ItemSlot } from 'common/type-aliases';
import DesktopEquippedItem from '../desktop/EquippedItem';
import MobileEquippedItem from '../mobile/EquippedItem';
import MageModal from './MageModal';
import SetModal from './SetModal';
import { Media } from './Media';

interface Props {
  customSet?: CustomSet | null;
  selectItemSlot: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  selectedItemSlotId: string | null;
  isMobile: boolean;
  errors: Array<BuildError>;
}

const EquipmentSlots = ({
  customSet,
  selectItemSlot,
  selectedItemSlotId,
  isMobile,
  errors,
}: Props) => {
  const { data } = useQuery<ItemSlots>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const equippedItemsBySlotId: {
    [key: string]: EquippedItem;
  } =
    customSet?.equippedItems.reduce(
      (acc, curr) => ({ ...acc, [curr.slot?.id]: curr }),
      {},
    ) ?? {};

  const [mageModalOpen, setMageModalOpen] = React.useState(false);
  const [equippedItem, setEquippedItem] = React.useState<EquippedItem | null>(
    null,
  );
  const openMageModal = React.useCallback(
    (ei) => {
      setEquippedItem(ei);
      setMageModalOpen(true);
    },
    [setMageModalOpen],
  );
  const closeMageModal = React.useCallback(() => {
    setMageModalOpen(false);
  }, [setMageModalOpen]);

  const { setModalOpen, selectedSet, openSetModal, closeSetModal } =
    useSetModal();

  const groupedErrors = groupBy(errors, ({ equippedItem: ei }) => ei.id);

  return (
    <div
      css={{
        display: 'grid',
        gridGap: 8,
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        flexShrink: 0,
        [mq[1]]: {
          display: 'flex',
          margin: '4px 8px',
          gap: 0,
        },
        [mq[4]]: {
          margin: '8px 12px',
        },
      }}
    >
      {itemSlots?.map((slot) => {
        const ei: EquippedItem | undefined = equippedItemsBySlotId[slot.id];
        const equippedItemErrors: Array<BuildError> | undefined =
          groupedErrors[ei?.id];
        return (
          <React.Fragment key={slot.id}>
            <Media lessThan="xs">
              <MobileEquippedItem
                slot={slot}
                key={slot.id}
                equippedItem={ei}
                customSet={customSet}
                openMageModal={openMageModal}
                openSetModal={openSetModal}
                errors={equippedItemErrors}
              />
            </Media>
            <Media
              greaterThanOrEqual="xs"
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
                css={{ marginLeft: 4, [mq[4]]: { marginLeft: 8 } }}
              />
            </Media>
          </React.Fragment>
        );
      })}
      {customSet && equippedItem && (
        <MageModal
          open={mageModalOpen}
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
          open={setModalOpen}
          onCancel={closeSetModal}
          customSet={customSet}
          shouldRedirect={isMobile}
        />
      )}
    </div>
  );
};

export default EquipmentSlots;
