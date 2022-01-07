/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/client';
import groupBy from 'lodash/groupBy';

import { itemSlots as ItemSlotsQueryType } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';

import { mq } from 'common/constants';
import { EditableContext, getImageUrl, useSetModal } from 'common/utils';
import { BuildError } from 'common/types';
import { CustomSet, EquippedItem } from 'common/type-aliases';
import { TooltipPlacement } from 'antd/lib/tooltip';
import MageModal from '../common/MageModal';
import SetModal from '../common/SetModal';
import BonusStats from './BonusStats';
import ClassicEquippedItem from './ClassicEquippedItem';
import { BuildGender } from '__generated__/globalTypes';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import DefaultClassModal from 'components/common/DefaultClassModal';

interface Props {
  customSet?: CustomSet | null;
  errors: Array<BuildError>;
  setDofusClassId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const NO_CLASS_IMG = getImageUrl('class/sprite/No_Class.png');

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

const ClassicEquipmentSlots: React.FC<Props> = ({
  customSet,
  errors,
  setDofusClassId,
}) => {
  const { data } = useQuery<ItemSlotsQueryType>(ItemSlotsQuery);
  const itemSlots = data?.itemSlots;

  const { data: currentUserData } = useQuery<CurrentUserQueryType>(
    currentUserQuery,
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
  const [
    defaultClassModalVisible,
    setDefaultClassModalVisible,
  ] = React.useState(false);
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

  const openDefaultClassModal = React.useCallback(() => {
    setDefaultClassModalVisible(true);
  }, []);
  const closeDefaultClassModal = React.useCallback(() => {
    setDefaultClassModalVisible(false);
  }, []);

  const isEditable = React.useContext(EditableContext);

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

  let spriteImageUrl = NO_CLASS_IMG;

  const userDefaultBuildClass =
    currentUserData?.currentUser?.settings.buildClass;

  if (customSet) {
    if (customSet.defaultClass) {
      spriteImageUrl = getImageUrl(
        customSet.buildGender === BuildGender.MALE
          ? customSet.defaultClass.maleSpriteImageUrl
          : customSet.defaultClass.femaleSpriteImageUrl,
      );
    }
  } else if (userDefaultBuildClass && currentUserData.currentUser) {
    spriteImageUrl = getImageUrl(
      currentUserData.currentUser.settings.buildGender === BuildGender.MALE
        ? userDefaultBuildClass.maleSpriteImageUrl
        : userDefaultBuildClass.femaleSpriteImageUrl,
    );
  }

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
            background: `transparent url('${spriteImageUrl}') no-repeat scroll center center`,
            backgroundSize: 'contain',
            alignSelf: 'stretch',
            cursor: isEditable ? 'pointer' : 'auto',
          }}
          onClick={isEditable ? openDefaultClassModal : undefined}
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
      {isEditable && (
        <DefaultClassModal
          visible={defaultClassModalVisible}
          closeModal={closeDefaultClassModal}
          setDofusClassId={setDofusClassId}
        />
      )}
    </div>
  );
};

export default ClassicEquipmentSlots;
