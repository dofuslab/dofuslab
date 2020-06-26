/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { CardTitleWithLevel } from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import { Theme, AppliedBuffAction } from 'common/types';
import { Item } from 'common/type-aliases';
import AddBuffLink from './AddBuffLink';

interface Props {
  item: Item;
  dispatch: React.Dispatch<AppliedBuffAction>;
}

const ItemBuffCard: React.FC<Props> = ({ item, dispatch }) => {
  const theme = useTheme<Theme>();

  return (
    <Card
      size="small"
      title={
        <div css={{ display: 'flex' }}>
          <img
            src={item.imageUrl}
            css={{ width: 24, marginRight: 8 }}
            alt={item.name}
          />
          <CardTitleWithLevel title={item.name} />
        </div>
      }
      css={{
        ...itemCardStyle,
        background: theme.layer?.backgroundLight,
      }}
    >
      {item.buffs?.map((b) => (
        <AddBuffLink item={item} dispatch={dispatch} isCrit={false} buff={b} />
      ))}
    </Card>
  );
};

export default ItemBuffCard;
