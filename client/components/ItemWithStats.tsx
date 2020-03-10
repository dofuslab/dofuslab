/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import Popover from 'antd/lib/popover';

import { item } from 'graphql/fragments/__generated__/item';
import { ItemStatsList } from 'common/wrappers';
import {
  itemBoxDimensions,
  popoverTitleStyle,
  itemImageBox,
  selected as selectedBox,
} from 'common/mixins';

interface IProps {
  item: item;
  selected: boolean;
}

const ItemWithStats: React.FC<IProps> = ({ item, selected }) => {
  return (
    <ClassNames>
      {({ css }) => (
        <Popover
          placement="bottom"
          title={item.name}
          content={<ItemStatsList item={item} />}
          overlayClassName={css(popoverTitleStyle)}
        >
          <div
            css={selected ? { ...itemImageBox, ...selectedBox } : itemImageBox}
          >
            <img src={item.imageUrl} css={itemBoxDimensions} />
          </div>
        </Popover>
      )}
    </ClassNames>
  );
};

export default ItemWithStats;
