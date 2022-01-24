/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { itemBox, itemImageBox } from 'common/mixins';
import Link from 'next/link';
import { BuildError, Theme } from 'common/types';

import {
  ItemSet,
  ItemSlot,
  EquippedItem as EquippedItemType,
  CustomSet,
} from 'common/type-aliases';
import { EditableContext, getImageUrl } from 'common/utils';
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
  customSet,
  openMageModal,
  openSetModal,
  errors,
}) => {
  const theme = useTheme<Theme>();
  const isEditable = React.useContext(EditableContext);

  const urlBase = isEditable ? 'build' : 'view';

  const hrefPath = `/${urlBase}/[customSetId]/[equippedItemId]`;
  const asPath = `/${urlBase}/${customSet?.id}/${equippedItem?.id}`;

  const emptyItemSlot = (
    <div
      css={{
        ...itemImageBox(theme),
      }}
    >
      <img
        src={getImageUrl(slot.imageUrl)}
        css={{
          maxWidth: '100%',
          opacity: 0.4,
          transition: 'all 0.3s',
        }}
        alt={slot.name}
      />
    </div>
  );

  const content = isEditable ? (
    <Link
      href={{
        pathname: customSet
          ? '/equip/[itemSlotId]/[customSetId]'
          : '/equip/[itemSlotId]/',
        query: { itemSlotId: slot.id, customSetId: customSet?.id },
      }}
      as={`/equip/${slot.id}/${customSet ? `${customSet.id}/` : ''}`}
    >
      <a>{emptyItemSlot}</a>
    </Link>
  ) : (
    emptyItemSlot
  );

  return (
    <>
      <div css={itemBox}>
        {customSet && equippedItem ? (
          <Link
            href={{
              pathname: hrefPath,
              query: {
                customSetId: customSet.id,
                equippedItemId: equippedItem.id,
              },
            }}
            as={asPath}
          >
            <div>
              <EquippedItemWithStats
                equippedItem={equippedItem}
                selected={false}
                customSet={customSet}
                itemSlotId={slot.id}
                openMageModal={openMageModal}
                openSetModal={openSetModal}
                errors={errors}
              />
            </div>
          </Link>
        ) : (
          content
        )}
      </div>
    </>
  );
};

export default React.memo(EquippedItem);
