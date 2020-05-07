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
import { CustomSet, EquippedItem } from 'common/type-aliases';
import { useRouter } from 'next/router';
import { classes } from 'graphql/queries/__generated__/classes';
import classesQuery from 'graphql/queries/classes.graphql';
import { TooltipPlacement } from 'antd/lib/tooltip';
import MageModal from '../common/MageModal';
import SetModal from '../common/SetModal';
import BonusStats from './BonusStats';
import ClassicEquippedItem from './ClassicEquippedItem';

interface Props {
  customSet?: CustomSet | null;
  errors: Array<BuildError>;
}

const NO_CLASS_IMG =
  'https://dofus-lab.s3.us-east-2.amazonaws.com/class/sprite/No_Class.png';

// "Amulet Character Character Character Character Hat"
// "Ring Character Character Character Character Cloak"
// "Ring2 Character Character Character Character Belt"
// "Weapon Character Character Character Character Boots"
// "Shield Character Character Character Character Pet"
// "Dofus Dofus2 Dofus3 Dofus4 Dofus5 Dofus6"

const getPopoverPlacement = (slotEnName: string): TooltipPlacement => {
  switch (slotEnName) {
    case 'Amulet':
    case 'Ring':
    case 'Weapon':
    case 'Shield':
      return 'right';
    case 'Dofus':
      return 'top';
    case 'Hat':
    case 'Cloak':
    case 'Belt':
    case 'Boots':
    case 'Pet':
      return 'left';
    default:
      return 'bottomLeft';
  }
};

const ClassicEquipmentSlots: React.FC<Props> = ({ customSet, errors }) => {
  const { data } = useQuery<ItemSlotsQueryType>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const router = useRouter();
  const { query } = router;

  const { data: classesData } = useQuery<classes>(classesQuery);
  const selectedClassName = Array.isArray(query.class)
    ? query.class[0]
    : query.class;
  const selectedClass = classesData?.classes.find((c) =>
    c.allNames.includes(selectedClassName),
  );

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

  const sortedItemSlots = itemSlots
    ? [...itemSlots].sort((s1, s2) => s1.order - s2.order)
    : [];
  const slotCounter: { [key: string]: number } = {};

  return (
    <div
      css={{
        display: 'grid',
        gridGap: 12,
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        gridTemplateAreas: `
          "Amulet Character Character Character Character Hat"
          "Ring Character Character Character Character Cloak"
          "Ring2 Character Character Character Character Belt"
          "Weapon Character Character Character Character Boots"
          "Shield Character Character Character Character Pet"
          "Dofus Dofus2 Dofus3 Dofus4 Dofus5 Dofus6"
        `,
        width: '100%',
      }}
    >
      {sortedItemSlots.map((slot) => {
        const ei: EquippedItem | undefined = equippedItemsBySlotId[slot.id];
        const equippedItemErrors: Array<BuildError> | undefined =
          groupedErrors[ei?.id];
        const count = slotCounter[slot.enName];
        slotCounter[slot.enName] = count ? count + 1 : 1;

        return (
          <div
            key={`slot-${slot.id}`}
            css={{
              minWidth: 0,
              gridArea: `${slot.enName}${
                count ? slotCounter[slot.enName] : ''
              }`,
            }}
          >
            <ClassicEquippedItem
              slot={slot}
              key={slot.id}
              equippedItem={ei}
              customSet={customSet}
              openMageModal={openMageModal}
              openSetModal={openSetModal}
              errors={equippedItemErrors}
              popoverPlacement={getPopoverPlacement(slot.enName)}
            />
          </div>
        );
      })}
      <div
        css={{
          gridArea: 'Character',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          css={{ flex: '0 0 120px', maxWidth: 320, [mq[4]]: { maxWidth: 360 } }}
        >
          {customSet && (
            <BonusStats customSet={customSet} isMobile={false} isClassic />
          )}
        </div>
        <div
          css={{
            flex: '1 1 0',
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            minWidth: 0,
            background: `transparent url('${
              selectedClass ? selectedClass.maleSpriteImageUrl : NO_CLASS_IMG
            }') no-repeat scroll center center`,
            backgroundSize: 'contain',
            alignSelf: 'stretch',
          }}
        />
      </div>
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
        />
      )}
    </div>
  );
};

export default ClassicEquipmentSlots;
