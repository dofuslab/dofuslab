/** @jsxImportSource @emotion/react */

import React from 'react';
import { ClassNames, useTheme } from '@emotion/react';

import { itemBox, itemImageBox } from 'common/mixins';

import { BuildError } from 'common/types';
import Link from 'next/link';
import {
  ItemSlot,
  EquippedItem,
  ItemSet,
  CustomSet,
} from 'common/type-aliases';
import { EditableContext, getImageUrl, slotToUrlString } from 'common/utils';
import { TooltipPlacement } from 'antd/lib/tooltip';
import EquippedItemWithStats from '../common/EquippedItemWithStats';

interface Props {
  slot: ItemSlot;
  equippedItem?: EquippedItem;
  customSet?: CustomSet | null;
  openMageModal: (equippedItem: EquippedItem) => void;
  openSetModal: (set: ItemSet) => void;
  className?: string;
  errors?: Array<BuildError>;
  popoverPlacement?: TooltipPlacement;
}

const ClassicEquippedItem: React.FC<Props> = ({
  slot,
  equippedItem,
  customSet,
  openMageModal,
  openSetModal,
  errors,
  className,
  popoverPlacement,
}) => {
  const theme = useTheme();

  const isEditable = React.useContext(EditableContext);

  return (
    <ClassNames>
      {({ css, cx }) => {
        const content = (
          <div className={cx(css(itemBox(theme)), className)}>
            {equippedItem && customSet ? (
              <EquippedItemWithStats
                equippedItem={equippedItem}
                selected={false}
                customSet={customSet}
                itemSlotId={slot.id}
                openMageModal={openMageModal}
                openSetModal={openSetModal}
                errors={errors}
                popoverPlacement={popoverPlacement}
              />
            ) : (
              <div
                className={cx(
                  css(itemImageBox(theme)),
                  {
                    [css({
                      '&:hover > img': {
                        opacity: 0.65,
                      },
                    })]: isEditable,
                  },
                  { [css({ cursor: 'auto' })]: !isEditable },
                )}
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
            )}
          </div>
        );

        return isEditable ? (
          <Link
            href={`/equip/${slotToUrlString(slot)}/${
              customSet ? customSet.id : ''
            }`}
          >
            <a>{content}</a>
          </Link>
        ) : (
          content
        );
      }}
    </ClassNames>
  );
};

export default React.memo(ClassicEquippedItem);
