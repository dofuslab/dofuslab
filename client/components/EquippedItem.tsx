/** @jsx jsx */

import React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import Popover from 'antd/lib/popover';

import { BORDER_COLOR } from 'common/mixins';
import { customSet_customSetById_equippedItems_item } from 'graphql/queries/__generated__/customSet';
import { ItemStatsList } from 'common/wrappers';

interface IEquippedItem {
  slotName: string;
  item?: customSet_customSetById_equippedItems_item;
}

const EquippedItem: React.FC<IEquippedItem> = ({
  slotName,
  item,
  ...restProps
}) => {
  const itemDisplay = (
    <div
      css={{
        background: 'white',
        border: `1px solid ${BORDER_COLOR}`,
        width: 72,
        height: 72,
        margin: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.75rem',
        borderRadius: 4,
      }}
      {...restProps}
    >
      {item ? (
        <img src={item.imageUrl} css={{ width: '100%', height: '100%' }} />
      ) : (
        slotName
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
