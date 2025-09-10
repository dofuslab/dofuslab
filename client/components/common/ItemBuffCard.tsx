/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { useTheme } from '@emotion/react';

import { CardTitleWithLevel } from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import { Item } from 'common/type-aliases';
import { getImageUrl } from 'common/utils';
import AddBuffLink from './AddBuffLink';

interface Props {
  item: Item;
}

const ItemBuffCard = ({ item }: Props) => {
  const theme = useTheme();

  return (
    <Card
      size="small"
      title={
        <div css={{ display: 'flex' }}>
          <img
            src={getImageUrl(item.imageUrl)}
            css={{ width: 24, height: 24, marginRight: 8 }}
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
        <AddBuffLink key={b.id} item={item} isCrit={false} buff={b} />
      ))}
    </Card>
  );
};

export default ItemBuffCard;
