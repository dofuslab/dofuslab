/** @jsx jsx */

import { jsx, CSSObject } from '@emotion/core';
import styled from '@emotion/styled';
import { BackTop } from 'antd';
import { useTheme } from 'emotion-theming';
import {
  ellipsis,
  getResponsiveGridStyle,
  itemCardStyle,
  blue6,
  gray6,
} from './mixins';
import { Card } from 'antd';
import { Skeleton } from 'antd';
import { set_bonuses } from 'graphql/fragments/__generated__/set';
import { TFunction } from 'next-i18next';
import { useTranslation } from 'i18n';
import {
  WeaponEffectType,
  SpellEffectType,
  Stat,
  WeaponElementMage,
} from '__generated__/globalTypes';
import {
  effectToIconUrl,
  getSimpleEffect,
  elementMageToWeaponEffect,
  calcElementMage,
} from './utils';
import { item_weaponStats } from 'graphql/fragments/__generated__/item';
import { TTheme } from './themes';

interface IResponsiveGrid {
  readonly numColumns: ReadonlyArray<number>;
}

export const ResponsiveGrid = styled.div<IResponsiveGrid>(({ numColumns }) =>
  getResponsiveGridStyle(numColumns),
);

export const Badge: React.FC = ({ children, ...restProps }) => {
  const theme = useTheme<TTheme>();
  return (
    <span
      css={{
        background: theme.badge?.background,
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
};

export const TruncatableText: React.FC = ({ children, ...restProps }) => (
  <span
    css={ellipsis}
    title={typeof children === 'string' ? children : undefined}
    {...restProps}
  >
    {children}
  </span>
);

export const CardSkeleton: React.FC = props => {
  const theme = useTheme<TTheme>();
  return (
    <Card
      size="small"
      css={{
        ...itemCardStyle,
        border: `1px solid ${theme.border?.default}`,
      }}
      {...props}
    >
      <Skeleton loading title active paragraph={{ rows: 6 }}></Skeleton>
    </Card>
  );
};

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
    {bonuses.length ? (
      <ul css={{ paddingInlineStart: '16px', marginTop: 8 }}>
        {bonuses.map(bonus => (
          <li key={bonus.id} css={{ fontSize: '0.75rem' }}>
            {!!bonus.value && !!bonus.stat
              ? `${bonus.value} ${t(bonus.stat, { ns: 'stat' })}`
              : bonus.customStat}
          </li>
        ))}
      </ul>
    ) : (
      <div css={{ color: gray6, fontStyle: 'italic' }}>
        {t('NO_BONUS', { ns: 'common' })}
      </div>
    )}
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
  rightAlignedContent?: React.ReactNode;
}> = ({ title, level, showBadge, badgeContent, rightAlignedContent }) => {
  const { t } = useTranslation('common');
  return (
    <div css={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
      <TruncatableText css={{ fontSize: '0.8rem' }}>{title}</TruncatableText>
      {showBadge && <Badge css={{ marginRight: 4 }}>{badgeContent}</Badge>}
      {level && (
        <div
          css={{
            fontSize: '0.75rem',
            fontWeight: 400,
            marginLeft: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {t('LEVEL_ABBREVIATION', { ns: 'common' })} {level}
        </div>
      )}
      {rightAlignedContent && (
        <div
          css={{
            fontSize: '0.75rem',
            fontWeight: 400,
            marginLeft: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {rightAlignedContent}
        </div>
      )}
    </div>
  );
};

export const damageHeaderStyle = {
  fontWeight: 500,
  marginBottom: 4,
};

export const EffectLine: React.FC<{
  min: number | null;
  max: number;
  effectType: WeaponEffectType | SpellEffectType;
  baseMax: number;
}> = ({ min, max, effectType, baseMax }) => {
  const { t } = useTranslation(['stat', 'weapon_spell_effect']);
  let content = null;
  switch (getSimpleEffect(effectType)) {
    case 'damage':
    case 'heal':
      content = `${min !== null ? `${min}-` : ''}${max}`;
      break;
    case 'pushback_damage':
      content = `${max} (${t('CELL', {
        count: baseMax,
        ns: 'weapon_spell_effect',
      })})`;
      break;
    case 'shield':
      content = max;
      break;
    case 'ap':
      content = `${max} ${t(Stat.AP)}`;
      break;
    case 'mp':
      content = `${max} ${t(Stat.MP)}`;
  }
  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img
        src={effectToIconUrl(effectType)}
        css={{ height: 16, width: 16, marginRight: 8 }}
      />
      {content}
    </div>
  );
};

export const WeaponEffectsList: React.FC<{
  weaponStats: item_weaponStats;
  className?: string;
  innerDivStyle?: CSSObject;
  elementMage?: WeaponElementMage | null;
}> = ({ weaponStats, className, innerDivStyle, elementMage }) => {
  const { t } = useTranslation('weapon_spell_effect');
  return (
    <div className={className}>
      {weaponStats.weaponEffects.map(effect => {
        let { effectType, minDamage, maxDamage } = effect;

        if (elementMage && effectType === WeaponEffectType.NEUTRAL_DAMAGE) {
          ({ minDamage, maxDamage } = calcElementMage(
            elementMage,
            minDamage || maxDamage,
            maxDamage,
          ));

          effectType = elementMageToWeaponEffect(elementMage);
        }

        return (
          <div
            key={`weapon-effect-${effect.id}`}
            css={{ display: 'flex', alignItems: 'center', ...innerDivStyle }}
          >
            <img
              src={effectToIconUrl(effectType)}
              css={{ height: 16, width: 16, marginRight: 8 }}
            />
            <div
              css={{
                color:
                  elementMage &&
                  effect.effectType === WeaponEffectType.NEUTRAL_DAMAGE
                    ? blue6
                    : 'inherit',
              }}
            >
              {minDamage !== null ? `${minDamage}-` : ''}
              {maxDamage} {t(`EFFECT_TYPE.${effectType}`)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
