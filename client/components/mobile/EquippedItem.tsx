/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';
import Link from 'next/link';
import { BuildError } from 'common/types';
import { TTheme } from 'common/themes';
import {
  ItemSet,
  ItemSlot,
  EquippedItem as EquippedItemType,
  CustomSet,
} from 'common/type-aliases';
import EquippedItemWithStats from '../common/EquippedItemWithStats';

interface Props {
  slot: ItemSlot;
  equippedItem?: EquippedItemType;
  customSet?: CustomSet | null;
  selected: boolean;
  openMageModal: (equippedItem: EquippedItemType) => void;
  openSetModal: (set: ItemSet) => void;
  errors?: Array<BuildError>;
}

const EquippedItem: React.FC<Props> = ({
  slot,
  equippedItem,
  selected,
  customSet,
  openMageModal,
  openSetModal,
  errors,
}) => {
  const theme = useTheme<TTheme>();

  return (
    <>
      <div css={itemBox}>
        {customSet && equippedItem ? (
          <Link
            href="/build/[customSetId]/[equippedItemId]"
            as={`/build/${customSet.id}/${equippedItem.id}`}
          >
            <div>
              <EquippedItemWithStats
                equippedItem={equippedItem}
                selected={selected}
                customSet={customSet}
                itemSlotId={slot.id}
                openMageModal={openMageModal}
                openSetModal={openSetModal}
                errors={errors}
              />
            </div>
          </Link>
        ) : (
          <Link
            href={{
              pathname: '/equip/[itemSlotId]',
              query: { itemSlotId: slot.id, customSetId: customSet?.id },
            }}
            as={`/equip/${slot.id}/${customSet ? customSet.id : ''}`}
          >
            <div
              css={{
                ...itemImageBox(theme),
                ...(selected ? selectedBox(theme) : {}),
              }}
            >
              <img
                src={slot.imageUrl}
                css={{
                  maxWidth: '100%',
                  opacity: selected ? 0.75 : 0.4,
                  transition: 'all 0.3s',
                }}
                alt={slot.name}
              />
            </div>
          </Link>
        )}
      </div>
    </>
  );
};

export default React.memo(EquippedItem);
