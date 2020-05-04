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
import EquippedItemWithStats from '../common/EquippedItemWithStats';

interface Props {
  slot: ItemSlot;
  equippedItem?: EquippedItem;
  customSet?: CustomSet | null;
  openMageModal: (equippedItem: EquippedItem) => void;
  openSetModal: (set: ItemSet) => void;
  className?: string;
  errors?: Array<BuildError>;
}

const ClassicEquippedItem: React.FC<Props> = ({
  slot,
  equippedItem,
  customSet,
  openMageModal,
  openSetModal,
  errors,
  className,
}) => {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { query } = router;

  return (
    <ClassNames>
      {({ css, cx }) => (
        <Link
          href={{
            pathname: '/equip/[itemSlotId]',
            query: {
              ...query,
              itemSlotId: slot.id,
              customSetId: customSet?.id,
            },
          }}
          as={`/equip/${slot.id}/${customSet ? customSet.id : ''}`}
        >
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
              />
            ) : (
              <div
                className={cx(
                  css(itemImageBox(theme)),
                  css({
                    '&:hover > img': {
                      opacity: 0.65,
                    },
                  }),
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
        </Link>
      )}
    </ClassNames>
  );
};

export default React.memo(ClassicEquippedItem);
