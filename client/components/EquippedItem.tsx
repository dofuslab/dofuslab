/** @jsx jsx */

import React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import Popover from 'antd/lib/popover';

import { itemBox } from 'common/mixins';
import { customSet_customSetById_equippedItems_item } from 'graphql/queries/__generated__/customSet';
import { ItemStatsList } from 'common/wrappers';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';

interface IEquippedItem {
  slot: itemSlots_itemSlots;
  item?: customSet_customSetById_equippedItems_item;
  selectItemSlot: React.Dispatch<React.SetStateAction<string | null>>;
}

const EquippedItem: React.FC<IEquippedItem> = ({
  slot,
  item,
  selectItemSlot,
  ...restProps
}) => {
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.nativeEvent.stopPropagation();
      selectItemSlot(slot.id);
    },
    [selectItemSlot, slot],
  );
  const itemDisplay = (
    <div css={itemBox} onClick={onClick} {...restProps}>
      {item ? (
        <img src={item.imageUrl} css={{ width: 72, height: 72 }} />
      ) : (
        slot.name
      )}
    </div>
  );

  return item ? (
    <ClassNames>
      {({ css }) => (
        <Popover
          placement="bottom"
          title={item.name}
          content={<ItemStatsList item={item} />}
          overlayClassName={css({
            ['.ant-popover-title']: { padding: '8px 16px' },
          })}
        >
          {itemDisplay}
        </Popover>
      )}
    </ClassNames>
  ) : (
    itemDisplay
  );
};

export default EquippedItem;
