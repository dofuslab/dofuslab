/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { useTranslation } from 'i18n';
import {
  gray7,
  ellipsis,
  getResponsiveGridStyle,
  blue6,
  itemCardStyle,
  BORDER_COLOR,
} from './mixins';
import { item } from 'graphql/fragments/__generated__/item';
import { customSet_equippedItems_exos } from 'graphql/fragments/__generated__/customSet';
import Card from 'antd/lib/card';
import Skeleton from 'antd/lib/skeleton';
import { set_bonuses } from 'graphql/fragments/__generated__/set';
import { TFunction } from 'next-i18next';

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

export const CardSkeleton: React.FC = props => (
  <Card
    size="small"
    css={{
      ...itemCardStyle,
      border: `1px solid ${BORDER_COLOR}`,
    }}
    {...props}
  >
    <Skeleton loading title active paragraph={{ rows: 6 }}></Skeleton>
  </Card>
);

export const SetBonuses: React.FC<{
  bonuses: Array<set_bonuses>;
  count: number;
  t: TFunction;
}> = ({ bonuses, count, t }) => (
  <div>
    <div css={{ fontSize: '0.75rem', fontWeight: 500 }}>
      {t('NUM_ITEMS', { ns: 'common', num: count })}
    </div>
    <ul css={{ paddingInlineStart: '16px', marginTop: 8 }}>
      {bonuses.map(bonus => (
        <li key={bonus.id} css={{ fontSize: '0.75rem' }}>
          {!!bonus.value && !!bonus.stat
            ? `${bonus.value} ${t(bonus.stat, { ns: 'stat' })}`
            : bonus.altStat}
        </li>
      ))}
    </ul>
  </div>
);
