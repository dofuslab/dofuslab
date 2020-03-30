/** @jsx jsx */

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import BackTop from 'antd/lib/back-top';
import {
  gray7,
  ellipsis,
  getResponsiveGridStyle,
  itemCardStyle,
  BORDER_COLOR,
} from './mixins';
import Card from 'antd/lib/card';
import Skeleton from 'antd/lib/skeleton';
import { set_bonuses } from 'graphql/fragments/__generated__/set';
import { TFunction } from 'next-i18next';
import { useTranslation } from 'i18n';

interface IResponsiveGrid {
  readonly numColumns: ReadonlyArray<number>;
}

export const ResponsiveGrid = styled.div<IResponsiveGrid>(({ numColumns }) =>
  getResponsiveGridStyle(numColumns),
);

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

export const TruncatableText: React.FC = ({ children, ...restProps }) => (
  <span
    css={ellipsis}
    title={typeof children === 'string' ? children : undefined}
    {...restProps}
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
  className?: string;
}> = ({ bonuses, count, t, className }) => (
  <div className={className}>
    <div css={{ fontSize: '0.75rem', fontWeight: 500 }}>
      {t('NUM_ITEMS', { ns: 'common', num: count })}
    </div>
    <ul css={{ paddingInlineStart: '16px', marginTop: 8 }}>
      {bonuses.map(bonus => (
        <li key={bonus.id} css={{ fontSize: '0.75rem' }}>
          {!!bonus.value && !!bonus.stat
            ? `${bonus.value} ${t(bonus.stat, { ns: 'stat' })}`
            : bonus.customStat}
        </li>
      ))}
    </ul>
  </div>
);

export const BackTopWrapper: React.FC<{ target: () => HTMLElement }> = ({
  target,
}) => <BackTop target={target} />;

export const CardTitleWithLevel: React.FC<{
  title: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  level?: number;
}> = ({ title, level, showBadge, badgeContent }) => {
  const { t } = useTranslation('common');
  return (
    <div css={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
      <TruncatableText css={{ fontSize: '0.8rem' }}>{title}</TruncatableText>
      {showBadge && <Badge css={{ marginRight: 4 }}>{badgeContent}</Badge>}
      {level && (
        <div css={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 'auto' }}>
          {t('LEVEL_ABBREVIATION', { ns: 'common' })} {level}
        </div>
      )}
    </div>
  );
};
