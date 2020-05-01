/** @jsx jsx */

import { jsx, CSSObject, ClassNames } from '@emotion/core';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import Head from 'next/head';

import {
  ellipsis,
  getResponsiveGridStyle,
  itemCardStyle,
  blue6,
  gray6,
} from './mixins';
import { Skeleton, Switch } from 'antd';
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
  getTitle,
  getCustomSetMetaDescription,
  getCanonicalUrl,
} from './utils';
import { item_weaponStats } from 'graphql/fragments/__generated__/item';
import { TTheme } from './themes';
import Card from 'components/common/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCube,
  faPeopleArrows,
  faFistRaised,
} from '@fortawesome/free-solid-svg-icons';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { mq } from './constants';
import Tooltip from 'components/common/Tooltip';
import { Media } from 'components/common/Media';

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

export const CardSkeleton: React.FC<{
  numRows?: number;
  className?: string;
}> = ({ numRows, className, ...restProps }) => {
  const theme = useTheme<TTheme>();
  return (
    <ClassNames>
      {({ css, cx }) => (
        <Card
          size="small"
          className={cx(
            css({
              ...itemCardStyle,
              border: `1px solid ${theme.border?.default}`,
            }),
            className,
          )}
          {...restProps}
        >
          <Skeleton
            loading
            title
            active
            paragraph={{ rows: numRows || 6 }}
          ></Skeleton>
        </Card>
      )}
    </ClassNames>
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

export const CardTitleWithLevel: React.FC<{
  title: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  level?: number;
  rightAlignedContent?: React.ReactNode;
  levelClassName?: string;
}> = ({
  title,
  level,
  showBadge,
  badgeContent,
  rightAlignedContent,
  levelClassName,
}) => {
  const { t } = useTranslation('common');
  return (
    <div css={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
      <TruncatableText css={{ fontSize: '0.8rem' }}>{title}</TruncatableText>
      {showBadge && <Badge css={{ marginRight: 4 }}>{badgeContent}</Badge>}
      {level && (
        <ClassNames>
          {({ css, cx }) => (
            <div
              className={cx(
                css({
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  marginLeft: 'auto',
                  whiteSpace: 'nowrap',
                }),
                levelClassName,
              )}
            >
              {t('LEVEL_ABBREVIATION', { ns: 'common' })} {level}
            </div>
          )}
        </ClassNames>
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

export const BrokenImagePlaceholder: React.FC<React.HTMLAttributes<
  HTMLDivElement
>> = ({ className, ...restProps }) => (
  <ClassNames>
    {({ css, cx }) => (
      <div
        className={cx(
          css({
            color: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }),
          className,
        )}
        {...(restProps as any)}
      >
        <FontAwesomeIcon icon={faCube} />
      </div>
    )}
  </ClassNames>
);

export const CustomSetHead: React.FC<{ customSet?: customSet | null }> = ({
  customSet,
}) => {
  const { t } = useTranslation('common');

  return (
    <Head>
      <title>
        {getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
      </title>

      <meta
        name="title"
        content={getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
      />
      <meta
        name="description"
        lang="en"
        content={getCustomSetMetaDescription(customSet)}
      />

      <meta
        property="og:title"
        content={getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
      />
      <meta
        property="og:description"
        content={getCustomSetMetaDescription(customSet)}
      />
      <meta property="og:url" content={getCanonicalUrl(customSet)} />

      <meta
        property="twitter:title"
        content={getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
      />
      <meta
        property="twitter:description"
        content={getCustomSetMetaDescription(customSet)}
      />
      <meta property="twitter:url" content={getCanonicalUrl(customSet)} />
    </Head>
  );
};

export const DamageTypeToggle: React.FC<{
  readonly showRanged: boolean;
  readonly setShowRanged: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ showRanged, setShowRanged }) => {
  const { t } = useTranslation('weapon_spell_effect');
  const theme = useTheme<TTheme>();

  const toggleSwitch = (
    <Switch
      checked={showRanged}
      onChange={setShowRanged}
      css={{
        background: theme.switch?.background,
        '.ant-switch-inner': {
          color: theme.text?.default,
        },
        '&::after': {
          background: theme.switch?.button,
        },
      }}
      checkedChildren={<FontAwesomeIcon icon={faPeopleArrows} />}
      unCheckedChildren={<FontAwesomeIcon icon={faFistRaised} />}
    />
  );

  return (
    <div
      css={{
        display: 'flex',
        marginBottom: 8,
      }}
    >
      <span css={{ marginRight: 8, [mq[1]]: { display: 'none' } }}>
        {t('MELEE')}
      </span>
      <Media lessThan="xs">{toggleSwitch}</Media>
      <Media greaterThanOrEqual="xs">
        <Tooltip
          title={showRanged ? t('RANGED') : t('MELEE')}
          getPopupContainer={element => element.parentElement!}
        >
          {toggleSwitch}
        </Tooltip>
      </Media>
      <span css={{ marginLeft: 8, [mq[1]]: { display: 'none' } }}>
        {t('RANGED')}
      </span>
    </div>
  );
};
