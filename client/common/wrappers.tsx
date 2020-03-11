/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { useTranslation } from 'i18n';
import { TFunction } from 'next-i18next';
import { items_items_edges_node_stats } from 'graphql/queries/__generated__/items';
import { gray7, ellipsis, getResponsiveGridStyle } from './mixins';
import { item } from 'graphql/fragments/__generated__/item';

interface IResponsiveGrid {
  readonly numColumns: ReadonlyArray<number>;
}

export const ResponsiveGrid = styled.div<IResponsiveGrid>(({ numColumns }) =>
  getResponsiveGridStyle(numColumns),
);

function displayStats(t: TFunction, statLine: items_items_edges_node_stats) {
  const statName = t(statLine.stat as string);
  return `${statLine.maxValue} ${statName}`;
}

interface IITemsStatsList {
  readonly item: item;
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

export const Badge: React.FC = ({ children }) => (
  <span
    css={{
      background: gray7,
      color: 'white',
      textTransform: 'uppercase',
      fontSize: '0.75em',
      fontWeight: 500,
      padding: '2px 4px',
      borderRadius: 4,
      marginLeft: 8,
    }}
  >
    {children}
  </span>
);

export const TruncatableText: React.FC = ({ children }) => (
  <span
    css={ellipsis}
    title={typeof children === 'string' ? children : undefined}
  >
    {children}
  </span>
);
