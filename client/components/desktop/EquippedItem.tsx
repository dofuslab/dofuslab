/** @jsxImportSource @emotion/react */

import React from 'react';
import { ClassNames, useTheme } from '@emotion/react';

import { itemBox, itemImageBox, selected as selectedBox } from 'common/mixins';

import { BuildError } from 'common/types';
import {
  ItemSlot,
  EquippedItem as EquippedItemType,
  ItemSet,
  CustomSet,
} from 'common/type-aliases';
import { getImageUrl } from 'common/utils';
import EquippedItemWithStats from '../common/EquippedItemWithStats';

interface Props {
  slot: ItemSlot;
  equippedItem?: EquippedItemType;
  selectItemSlot: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  customSet?: CustomSet | null;
  selected: boolean;
  openMageModal: (equippedItem: EquippedItemType) => void;
  openSetModal: (set: ItemSet) => void;
  className?: string;
  errors?: Array<BuildError>;
}

const EquippedItem = ({
  slot,
  equippedItem,
  selectItemSlot,
  selected,
  customSet,
  openMageModal,
  openSetModal,
  errors,
  className,
}: Props) => {
  const onClick = React.useCallback(() => {
    if (selected) {
      selectItemSlot(null);
    } else {
      selectItemSlot(slot);
    }
  }, [selectItemSlot, slot, selected, equippedItem]);

  const theme = useTheme();

  return (
    <ClassNames>
      {({ css, cx }) => (
        <div className={cx(css(itemBox(theme)), className)} onClick={onClick}>
          {equippedItem && customSet ? (
            <EquippedItemWithStats
              equippedItem={equippedItem}
              selected={selected}
              customSet={customSet}
              itemSlotId={slot.id}
              openMageModal={openMageModal}
              openSetModal={openSetModal}
              errors={errors}
            />
          ) : (
            <div
              className={cx(
                css(itemImageBox(theme)),
                selected ? css(selectedBox(theme)) : undefined,
                css({
                  '&:hover > img': {
                    opacity: 0.65,
                  },
                }),
              )}
            >
              <img
                src={getImageUrl(slot.imageUrl)}
                css={{
                  maxWidth: '100%',
                  opacity: selected ? 0.75 : 0.4,
                  transition: 'all 0.3s',
                }}
                alt={slot.name}
              />
            </div>
          )}
        </div>
      )}
    </ClassNames>
  );
};

export default React.memo(EquippedItem);
