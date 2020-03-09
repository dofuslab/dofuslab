/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import Popover from 'antd/lib/popover';

import { item } from 'graphql/fragments/__generated__/item';
import { ItemStatsList } from 'common/wrappers';
import { itemBoxDimensions, popoverTitleStyle } from 'common/mixins';

interface IProps {
  item: item;
}

const ItemWithStats: React.FC<IProps> = ({ item }) => {
  return (
    <ClassNames>
      {({ css }) => (
        <Popover
          placement="bottom"
          title={item.name}
          content={<ItemStatsList item={item} />}
          overlayClassName={css(popoverTitleStyle)}
        >
          <img src={item.imageUrl} css={itemBoxDimensions} />
        </Popover>
      )}
    </ClassNames>
  );
};

export default ItemWithStats;
