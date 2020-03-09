/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import Popover from 'antd/lib/popover';

import { item_itemType } from 'graphql/fragments/__generated__/item';
import { useTranslation } from 'i18n';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemBox, selected } from 'common/mixins';
import ItemWithStats from './ItemWithStats';

interface IProps {
  itemTypeToConfirm: item_itemType | null;
  customSet: customSet;
  onCancel: () => void;
}

const ConfirmItemTypeModal: React.FC<IProps> = ({
  itemTypeToConfirm,
  customSet,
  children,
}) => {
  const { t } = useTranslation('common');
  const [selectedItemSlotId, setSelectedItemSlotId] = React.useState<
    string | null
  >(null);

  console.log(selectedItemSlotId);

  const onSlotSelect = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      console.log(e.currentTarget.dataset);
      setSelectedItemSlotId(e.currentTarget.dataset.slotId || null);
    },
    [setSelectedItemSlotId],
  );

  return (
    <Popover
      content={
        <div
          css={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
          }}
        >
          {customSet.equippedItems
            .filter(equippedItem =>
              itemTypeToConfirm?.eligibleItemSlots
                .map(slot => slot.id)
                .includes(equippedItem.slot.id),
            )
            .map(equippedItem => (
              <div
                css={{
                  ...itemBox,
                  ...(equippedItem.slot.id === selectedItemSlotId
                    ? selected
                    : {}),
                }}
                key={equippedItem.id}
                data-slot-id={equippedItem.slot.id}
                onClick={onSlotSelect}
              >
                <ItemWithStats item={equippedItem.item} />
              </div>
            ))}
        </div>
      }
      title="Which item would you like to replace?"
      trigger="click"
      visible={this.state.clicked}
      onVisibleChange={this.handleClickChange}
    >
      {children}
    </Popover>
  );
};

export default ConfirmItemTypeModal;
