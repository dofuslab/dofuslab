/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { useTranslation } from 'i18n';
import { gray7, ellipsis, getResponsiveGridStyle, blue6 } from './mixins';
import { item } from 'graphql/fragments/__generated__/item';
import { customSet_equippedItems_exos } from 'graphql/fragments/__generated__/customSet';

interface IResponsiveGrid {
  readonly numColumns: ReadonlyArray<number>;
}

export const ResponsiveGrid = styled.div<IResponsiveGrid>(({ numColumns }) =>
  getResponsiveGridStyle(numColumns),
);

interface IITemsStatsList {
  readonly item: item;
  readonly className?: string;
  readonly exos?: ReadonlyArray<customSet_equippedItems_exos> | null;
}

export const ItemStatsList: React.FC<IITemsStatsList> = ({
  item,
  className,
  exos,
}) => {
  const { t } = useTranslation('stat');

  const statsMap: {
    [key: string]: { value: number; maged: boolean };
  } = item.stats.reduce(
    (acc, { stat, maxValue }) =>
      stat ? { ...acc, [stat]: { value: maxValue, maged: false } } : acc,
    {},
  );

  let exoStatsMap: { [key: string]: number } = {};

  if (exos) {
    exoStatsMap = exos.reduce(
      (acc, { stat, value }) => ({ ...acc, [stat]: value }),
      {},
    );

    Object.entries(exoStatsMap).forEach(([stat, value]) => {
      if (statsMap[stat]) {
        statsMap[stat].value += value;
        statsMap[stat].maged = true;
        delete exoStatsMap[stat];
      }
    });
  }

  return (
    <>
      <ul
        className={className}
        css={{ paddingInlineStart: 16, fontSize: '0.75rem' }}
      >
        {item.stats.map((statLine, idx) => (
          <li
            key={`stat-${idx}`}
            css={{
              color:
                statLine.stat && statsMap[statLine.stat].maged
                  ? blue6
                  : 'inherit',
            }}
          >
            {statLine.stat
              ? `${statsMap[statLine.stat].value} ${t(statLine.stat)}`
              : statLine.altStat}
          </li>
        ))}
        {exos &&
          exos
            .filter(({ stat }) => !!exoStatsMap[stat])
            .map(({ stat, value }) => (
              <li key={`exo-${stat}`} css={{ color: blue6 }}>
                {value} {t(stat)}
              </li>
            ))}
      </ul>
    </>
  );
};

export const Badge: React.FC = ({ children, ...restProps }) => (
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
    {...restProps}
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
