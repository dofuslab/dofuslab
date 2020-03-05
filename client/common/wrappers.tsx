/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { mq } from './constants';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'next-i18next';
import {
  items_items_stats,
  items_items,
} from 'graphql/queries/__generated__/items';

interface IResponsiveGrid {
  readonly numColumns: ReadonlyArray<number>;
}

export const ResponsiveGrid = styled.div<IResponsiveGrid>(({ numColumns }) => ({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1fr',
  columnGap: 20,
  rowGap: 20,
  [mq[0]]: {
    gridTemplateColumns: `repeat(${numColumns[0]}, 1fr)`,
  },
  [mq[1]]: {
    gridTemplateColumns: `repeat(${numColumns[1]}, 1fr)`,
  },
  [mq[2]]: {
    gridTemplateColumns: `repeat(${numColumns[2]}, 1fr)`,
  },
  [mq[3]]: {
    gridTemplateColumns: `repeat(${numColumns[3]}, 1fr)`,
  },
  [mq[4]]: {
    gridTemplateColumns: `repeat(${numColumns[4]}, 1fr)`,
  },
  [mq[5]]: {
    gridTemplateColumns: `repeat(${numColumns[5]}, 1fr)`,
  },
}));

function displayStats(t: TFunction, statLine: items_items_stats) {
  const statName = t(statLine.stat as string);
  return `${statLine.maxValue} ${statName}`;
}

interface IITemsStatsList {
  readonly item: items_items;
  readonly className?: string;
}

export const ItemStatsList: React.FC<IITemsStatsList> = ({
  item,
  className,
}) => {
  const { t } = useTranslation('stat');
  return (
    <ul
      className={className}
      css={{ paddingInlineStart: 16, fontSize: '0.75rem' }}
    >
      {item.stats.map((statLine, idx) => {
        return <li key={`stat-${idx}`}>{displayStats(t, statLine)}</li>;
      })}
    </ul>
  );
};
