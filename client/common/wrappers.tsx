/* eslint-disable react/jsx-props-no-spreading */
/** @jsxImportSource @emotion/react */

import React from 'react';
import { CSSObject, ClassNames, useTheme } from '@emotion/react';
import Head from 'next/head';

import { Skeleton, Switch, Button } from 'antd';
import { TFunction, useTranslation } from 'next-i18next';
import {
  WeaponEffectType,
  SpellEffectType,
  Stat,
  WeaponElementMage,
} from '__generated__/globalTypes';
import Card from 'components/common/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCube,
  faPeopleArrows,
  faFistRaised,
  faBolt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import Tooltip from 'components/common/Tooltip';
import { Media } from 'components/common/Media';
import { useRouter } from 'next/router';
import { mq } from './constants';
import { AppliedBuff } from './types';
import {
  effectToIconUrl,
  getSimpleEffect,
  elementMageToWeaponEffect,
  calcElementMage,
  getTitle,
  getCustomSetMetaDescription,
  getCanonicalUrl,
  getCustomSetMetaImage,
  getImageUrl,
} from './utils';
import {
  ellipsis,
  getResponsiveGridStyle,
  itemCardStyle,
  blue6,
  gray6,
  gold5,
} from './mixins';
import { SetBonus, WeaponStats, CustomSet } from './type-aliases';
import { DEFAULT_LANGUAGE } from './i18n-utils';

export const ResponsiveGrid = ({
  numColumns,
  ...restProps
}: {
  numColumns: ReadonlyArray<number>;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div css={getResponsiveGridStyle(numColumns)} {...restProps} />
);

export const Badge = ({
  children,
  ...restProps
}: React.HTMLAttributes<HTMLSpanElement>) => {
  const theme = useTheme();
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
        display: 'inline-block',
      }}
      {...restProps}
    >
      {children}
    </span>
  );
};

export const TruncatableText = ({
  children,
  ...restProps
}: {
  className?: string;
}) => (
  <span
    css={ellipsis}
    title={typeof children === 'string' ? children : undefined}
    {...restProps}
  >
    {children}
  </span>
);

export const CardSkeleton = ({
  numRows,
  className,
  ...restProps
}: {
  numRows?: number;
  className?: string;
}) => {
  const theme = useTheme();
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
          <Skeleton loading title active paragraph={{ rows: numRows || 6 }} />
        </Card>
      )}
    </ClassNames>
  );
};

export const SetBonuses = ({
  bonuses,
  count,
  t,
  className,
}: {
  bonuses: Array<SetBonus>;
  count: number;
  t: TFunction;
  className?: string;
}) => (
  <div className={className}>
    <div css={{ fontSize: '0.75rem', fontWeight: 500 }}>
      {t('NUM_ITEMS', { ns: 'common', num: count })}
    </div>
    {bonuses.length ? (
      <ul css={{ paddingInlineStart: '16px', marginTop: 8 }}>
        {bonuses.map((bonus) => (
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

export const CardTitleWithLevel = ({
  title,
  level,
  showBadge,
  badgeContent,
  rightAlignedContent,
  levelClassName,
  className,
  afterLevel,
  leftImageUrl,
  leftImageAlt,
}: {
  title: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  level?: number;
  rightAlignedContent?: React.ReactNode;
  levelClassName?: string;
  className?: string;
  afterLevel?: React.ReactNode;
  leftImageUrl?: string;
  leftImageAlt?: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <ClassNames>
      {({ css, cx }) => (
        <div
          css={cx(
            className,
            css({ marginRight: 4, display: 'flex', alignItems: 'center' }),
          )}
        >
          {leftImageUrl && (
            <img
              src={leftImageUrl}
              alt={leftImageAlt}
              css={{ width: 36, height: 36, marginRight: 8 }}
            />
          )}
          <div css={{ minWidth: 0 }}>
            <div css={{ display: 'flex', alignItems: 'center' }}>
              <TruncatableText css={{ fontSize: '0.8rem' }}>
                {title}
              </TruncatableText>
              {showBadge && (
                <Badge css={{ marginRight: 4 }}>{badgeContent}</Badge>
              )}
            </div>
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {level && (
                <div
                  className={cx(
                    css({
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                    }),
                    levelClassName,
                  )}
                >
                  <span css={{ marginRight: 4 }}>
                    {t('LEVEL_ABBREVIATION', { ns: 'common' })} {level}
                  </span>
                  {afterLevel}
                </div>
              )}
            </div>
          </div>

          {rightAlignedContent && (
            <div css={{ marginLeft: 'auto' }}>{rightAlignedContent}</div>
          )}
        </div>
      )}
    </ClassNames>
  );
};

export const damageHeaderStyle = {
  fontWeight: 500,
  marginBottom: 4,
};

export const EffectLine = ({
  min,
  max,
  effectType,
  baseMax,
}: {
  min: number | null;
  max: number;
  effectType: WeaponEffectType | SpellEffectType;
  baseMax: number;
}) => {
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
      break;
    case 'misc':
      break;
    default:
      throw new Error('Unknown simple effect');
  }
  return content ? (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img
        src={getImageUrl(effectToIconUrl(effectType))}
        css={{ height: 16, width: 16, marginRight: 8 }}
        alt={effectType}
      />
      {content}
    </div>
  ) : null;
};

export const WeaponEffectsList = ({
  weaponStats,
  className,
  innerDivStyle,
  elementMage,
}: {
  weaponStats: WeaponStats;
  className?: string;
  innerDivStyle?: CSSObject;
  elementMage?: WeaponElementMage | null;
}) => {
  const { t } = useTranslation('weapon_spell_effect');
  return (
    <div className={className}>
      {weaponStats.weaponEffects.map((effect) => {
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
              src={getImageUrl(effectToIconUrl(effectType))}
              css={{ height: 16, width: 16, marginRight: 8 }}
              alt={effectType}
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

export const BrokenImagePlaceholder = ({
  className,
  ...restProps
}: React.HTMLAttributes<HTMLDivElement>) => (
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(restProps as any)}
      >
        <FontAwesomeIcon icon={faCube} />
      </div>
    )}
  </ClassNames>
);

export const CustomSetHead = ({
  customSet,
}: {
  customSet?: CustomSet | null;
}) => {
  const { t } = useTranslation('common');

  const router = useRouter();

  const locale = router.locale || router.defaultLocale || DEFAULT_LANGUAGE;

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
        lang={locale}
        content={getCustomSetMetaDescription(t, locale, customSet)}
      />
      <meta
        property="og:title"
        content={getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
      />
      <meta
        property="og:description"
        content={getCustomSetMetaDescription(t, locale, customSet)}
      />
      <meta property="og:url" content={getCanonicalUrl(customSet)} />
      <meta property="og:image" content={getCustomSetMetaImage(customSet)} />

      <meta
        property="twitter:title"
        content={getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
      />
      <meta
        property="twitter:description"
        content={getCustomSetMetaDescription(t, locale, customSet)}
      />
      <meta property="twitter:url" content={getCanonicalUrl(customSet)} />
      <meta
        property="twitter:image"
        content={getCustomSetMetaImage(customSet)}
      />
    </Head>
  );
};

export const DamageTypeToggle = ({
  showRanged,
  setShowRanged,
  rangedOnly,
  meleeOnly,
}: {
  readonly showRanged: boolean;
  readonly setShowRanged: React.Dispatch<React.SetStateAction<boolean>>;
  readonly rangedOnly: boolean;
  readonly meleeOnly: boolean;
}) => {
  const { t } = useTranslation('weapon_spell_effect');
  const theme = useTheme();

  const notPossibleWarning = (
    <span css={{ marginLeft: 8 }}>
      <Tooltip
        css={{ textAlign: 'center' }}
        title={meleeOnly ? t('RANGED_NOT_POSSIBLE') : t('MELEE_NOT_POSSIBLE')}
        arrowPointAtCenter={true}
      >
        <FontAwesomeIcon icon={faExclamationTriangle} css={{ color: gold5 }} />
      </Tooltip>
    </span>
  );

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
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <span css={{ marginRight: 8, [mq[1]]: { display: 'none' } }}>
        {t('MELEE')}
        {rangedOnly && notPossibleWarning}
      </span>
      <Media lessThan="xs">{toggleSwitch}</Media>
      <Media greaterThanOrEqual="xs">
        <Tooltip
          title={showRanged ? t('RANGED') : t('MELEE')}
          getPopupContainer={(element) => {
            if (element.parentElement) {
              return element.parentElement;
            }
            return document && document.body;
          }}
        >
          {toggleSwitch}
        </Tooltip>
      </Media>
      <span css={{ marginLeft: 8, [mq[1]]: { display: 'none' } }}>
        {t('RANGED')}
        {meleeOnly && notPossibleWarning}
      </span>
      <span css={{ display: 'none', [mq[1]]: { display: 'inline' } }}>
        {((rangedOnly && !showRanged) || (meleeOnly && showRanged)) &&
          notPossibleWarning}
      </span>
    </div>
  );
};

export function TotalDamageLine({
  totalObj,
  imageUrl,
  imageAlt,
}: {
  totalObj: {
    nonCrit: { min: number; max: number };
    crit: { min: number; max: number } | null;
  };
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <div css={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: 8 }}>
      <div css={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={getImageUrl(imageUrl)}
          css={{ height: 16, width: 16, marginRight: 8 }}
          alt={imageAlt}
        />
        {totalObj.nonCrit.min}-{totalObj.nonCrit.max}
      </div>
      {totalObj.crit && (
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={getImageUrl(imageUrl)}
            css={{ height: 16, width: 16, marginRight: 8 }}
            alt={imageAlt}
          />
          {totalObj.crit.min}-{totalObj.crit.max}
        </div>
      )}
    </div>
  );
}

export function BuffButton({
  openBuffModal,
  appliedBuffs,
  className,
}: {
  openBuffModal: () => void;
  appliedBuffs: Array<AppliedBuff>;
  // eslint-disable-next-line react/require-default-props
  className?: string;
}) {
  const { t } = useTranslation('common');
  return (
    <Button
      onClick={openBuffModal}
      icon={<FontAwesomeIcon icon={faBolt} css={{ marginRight: 8 }} />}
      className={className}
    >
      {appliedBuffs.length > 0
        ? t('BUFF_APPLIED', {
            count: appliedBuffs.length,
          })
        : t('BUFFS')}
    </Button>
  );
}

export function EmptyState(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) {
  const theme = useTheme();
  return (
    <div
      css={{
        padding: 64,
        backgroundColor: theme.layer?.backgroundLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 4,
        wordWrap: 'break-word',
      }}
      {...props}
    ></div>
  );
}
