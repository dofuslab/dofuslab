/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  items_items,
  items_items_stats,
} from '../graphql/queries/__generated__/items';
import { BORDER_COLOR } from '../common/mixins';

interface IItem {
  item: items_items;
}

function displayStats(t: TFunction, statLine: items_items_stats) {
  const statName = t(statLine.stat as string);
  return `${statLine.maxValue} ${statName}`;
}

const Item: React.FC<IItem> = props => {
  const { t } = useTranslation('stat');
  return (
    <Card
      size="small"
      title={props.item.name}
      css={{
        width: '100%',
        fontSize: '0.75rem',
        borderRadius: 4,
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <ul css={{ paddingLeft: 15, marginBottom: 0 }}>
        {props.item.stats.map((statLine, idx) => {
          return <li key={`stat-${idx}`}>{displayStats(t, statLine)}</li>;
        })}
      </ul>
    </Card>
  );
};

export default Item;
