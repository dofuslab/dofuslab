/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';
import { customSet_customSetById_equippedItems } from 'graphql/queries/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import {
  customSet,
  customSet_equippedItems,
} from 'graphql/fragments/__generated__/customSet';
import EquippedItemWithStats from '../common/EquippedItemWithStats';
import { item_set } from 'graphql/fragments/__generated__/item';
import Link from 'next/link';
import { IError } from 'common/types';
import { TTheme } from 'common/themes';

interface IProps {
  slot: itemSlots_itemSlots;
  equippedItem?: customSet_customSetById_equippedItems;
  customSet?: customSet | null;
  selected: boolean;
  openMageModal: (equippedItem: customSet_equippedItems) => void;
  openSetModal: (set: item_set) => void;
  errors?: Array<IError>;
}

const EquippedItem: React.FC<IProps> = ({
  slot,
  equippedItem,
  selected,
  customSet,
  openMageModal,
  openSetModal,
  errors,
  ...restProps
}) => {
  const theme = useTheme<TTheme>();

  return (
    <>
      <div css={itemBox} {...restProps}>
        {equippedItem ? (
          <Link
            href="/build/[customSetId]/[equippedItemId]"
            as={`/build/${customSet!.id}/${equippedItem.id}`}
          >
            <div>
              <EquippedItemWithStats
                equippedItem={equippedItem}
                selected={selected}
                customSet={customSet!}
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
                  opacity: selected ? 0.65 : 0.3,
                  transition: 'all 0.3s',
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </>
  );
};

export default React.memo(EquippedItem);
