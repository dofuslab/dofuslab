/** @jsx jsx */

import React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { itemBox, itemImageBox } from 'common/mixins';

import { BuildError, Theme } from 'common/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ItemSlot,
  EquippedItem,
  ItemSet,
  CustomSet,
} from 'common/type-aliases';
import { EditableContext } from 'common/utils';
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
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { query } = router;

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
                  src={slot.imageUrl}
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
            href={{
              pathname: customSet
                ? '/equip/[itemSlotId]/[customSetId]'
                : '/equip/[itemSlotId]',
              query: {
                itemSlotId: slot.id,
                customSetId: customSet?.id,
              },
            }}
            as={{
              pathname: `/equip/${slot.id}/${customSet ? customSet.id : ''}`,
              query: query.class ? { class: query.class } : undefined,
            }}
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
