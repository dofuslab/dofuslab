/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import { CardTitleWithLevel } from 'common/wrappers';
// import { useTranslation } from 'i18n';
import { itemCardStyle, BORDER_COLOR, gray2, gray6 } from 'common/mixins';
import { item_weaponStats } from 'graphql/fragments/__generated__/item';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import {
  calcDamage,
  getStatsFromCustomSet,
  weaponEffectToIconUrl,
  calcHeal,
  getStatWithDefault,
} from 'common/utils';
import { StatsFromCustomSet, ICalcDamageInput } from 'common/types';
import { Stat, WeaponEffectType } from '__generated__/globalTypes';
import { useTranslation } from 'i18n';
import Divider from 'antd/lib/divider';

interface IProps {
  weaponStats: item_weaponStats;
  customSet: customSet;
}

type TSimpleEffect = 'damage' | 'heal' | 'other';

type TEffectMinMax = { min: number | null; max: number };

type TEffectLine = {
  id: string;
  type: WeaponEffectType;
  nonCrit: TEffectMinMax;
  crit: TEffectMinMax | null;
};

const headerStyle = {
  fontWeight: 500,
  marginBottom: 4,
};

const getSimpleEffect: (
  effectType: WeaponEffectType,
) => TSimpleEffect = effectType => {
  switch (effectType) {
    case WeaponEffectType.AIR_DAMAGE:
    case WeaponEffectType.AIR_STEAL:
    case WeaponEffectType.EARTH_DAMAGE:
    case WeaponEffectType.EARTH_STEAL:
    case WeaponEffectType.FIRE_DAMAGE:
    case WeaponEffectType.FIRE_STEAL:
    case WeaponEffectType.WATER_DAMAGE:
    case WeaponEffectType.WATER_STEAL:
    case WeaponEffectType.NEUTRAL_DAMAGE:
    case WeaponEffectType.NEUTRAL_STEAL:
      return 'damage';
    case WeaponEffectType.HP_RESTORED:
      return 'heal';
    case WeaponEffectType.AP:
    case WeaponEffectType.MP:
      return 'other';
  }
};

const calcEffect = (
  baseDamage: number,
  effectType: WeaponEffectType,
  stats: StatsFromCustomSet,
  damageTypeInput: ICalcDamageInput,
  damageTypeKey: 'melee' | 'ranged',
  weaponSkillPower?: number,
) => {
  const simpleEffect = getSimpleEffect(effectType);

  if (simpleEffect === 'heal') {
    return calcHeal(baseDamage, stats, weaponSkillPower);
  } else if (simpleEffect === 'damage') {
    return calcDamage(
      baseDamage,
      effectType,
      stats,
      damageTypeInput,
      weaponSkillPower,
    )[damageTypeKey];
  }
  return baseDamage;
};

const WeaponDamage: React.FC<IProps> = ({ weaponStats, customSet }) => {
  const { t } = useTranslation(['weapon_stat', 'stat']);
  const [weaponSkillPower, setWeaponSkillPower] = React.useState(300);
  const statsFromCustomSet = getStatsFromCustomSet(
    customSet,
  ) as StatsFromCustomSet;

  const onWeaponSkillChange = React.useCallback(
    (e: RadioChangeEvent) => {
      setWeaponSkillPower(Number(e.target.value));
    },
    [setWeaponSkillPower],
  );

  const rangedOnly = weaponStats.minRange && weaponStats.minRange > 1;
  const damageTypeKey = rangedOnly ? 'ranged' : 'melee';
  const critRate =
    typeof weaponStats.baseCritChance === 'number'
      ? getStatWithDefault(statsFromCustomSet, Stat.CRITICAL) +
        weaponStats.baseCritChance
      : null;

  const weaponEffectSummaries: Array<TEffectLine> = weaponStats.weaponEffects.map(
    ({ minDamage, maxDamage, effectType, id }) => {
      return {
        id,
        type: effectType,
        nonCrit: {
          min: minDamage
            ? calcEffect(
                minDamage,
                effectType,
                statsFromCustomSet,
                { isWeapon: true },
                damageTypeKey,
                weaponSkillPower,
              )
            : null,
          max: calcEffect(
            maxDamage,
            effectType,
            statsFromCustomSet,
            { isWeapon: true },
            damageTypeKey,
            weaponSkillPower,
          ),
        },
        crit:
          weaponStats.baseCritChance === null ||
          weaponStats.critBonusDamage === null
            ? null
            : {
                min: minDamage
                  ? calcEffect(
                      minDamage +
                        (getSimpleEffect(effectType) === 'other'
                          ? 0
                          : weaponStats.critBonusDamage),
                      effectType,
                      statsFromCustomSet,
                      { isWeapon: true, isCrit: true },
                      damageTypeKey,
                      weaponSkillPower,
                    )
                  : null,
                max: calcEffect(
                  maxDamage +
                    (getSimpleEffect(effectType) === 'other'
                      ? 0
                      : weaponStats.critBonusDamage),
                  effectType,
                  statsFromCustomSet,
                  { isWeapon: true, isCrit: true },
                  damageTypeKey,
                  weaponSkillPower,
                ),
              },
      };
    },
  );

  const averageNonCritDamage = weaponEffectSummaries
    .filter(({ type }) => getSimpleEffect(type) === 'damage')
    .reduce((acc, { nonCrit }) => {
      const average = nonCrit.min
        ? (nonCrit.min + nonCrit.max) / 2
        : nonCrit.max;
      return acc + average;
    }, 0);

  const averageCritDamage = weaponEffectSummaries
    .filter(({ type }) => getSimpleEffect(type) === 'damage')
    .reduce((acc, { crit }) => {
      if (acc === null || crit === null) {
        return null;
      }
      const average = crit.min ? (crit.min + crit.max) / 2 : crit.max;
      return acc + average;
    }, 0 as number | null);

  const weightedAverageDamage =
    averageCritDamage !== null && critRate
      ? averageCritDamage * (critRate / 100) +
        averageNonCritDamage * (1 - critRate / 100)
      : averageNonCritDamage;

  const averageNonCritHeal = weaponEffectSummaries
    .filter(({ type }) => getSimpleEffect(type) === 'heal')
    .reduce((acc, { nonCrit }) => {
      const average = nonCrit.min
        ? (nonCrit.min + nonCrit.max) / 2
        : nonCrit.max;
      return acc + average;
    }, 0);

  const averageCritHeal = weaponEffectSummaries
    .filter(({ type }) => getSimpleEffect(type) === 'heal')
    .reduce((acc, { crit }) => {
      if (acc === null || crit === null) {
        return null;
      }
      const average = crit.min ? (crit.min + crit.max) / 2 : crit.max;
      return acc + average;
    }, 0 as number | null);

  const weightedAverageHeal =
    averageCritHeal !== null && critRate
      ? averageCritHeal * (critRate / 100) +
        averageNonCritHeal * (1 - critRate / 100)
      : averageNonCritHeal;

  return (
    <Card
      size="small"
      title={<CardTitleWithLevel title="Weapon Damage" />}
      css={{
        ...itemCardStyle,
        [':hover']: {
          border: `1px solid ${BORDER_COLOR}`,
        },
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <Radio.Group value={weaponSkillPower} onChange={onWeaponSkillChange}>
        <Radio value={0}>{t('NO_WEAPON_SKILL')}</Radio>
        <Radio value={300}>
          {t('WEAPON_SKILL')} (300 {t('POWER', { ns: 'stat' })})
        </Radio>
        <Radio value={350}>
          {t('WEAPON_SKILL')} (350 {t('POWER', { ns: 'stat' })})
        </Radio>
      </Radio.Group>
      <Divider css={{ margin: '12px 0' }} />
      <div css={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div css={headerStyle}>{t('NON_CRIT')}</div>
        {weaponStats.baseCritChance ? (
          <div css={headerStyle}>
            {t('CRIT_WITH_PERCENTAGE', {
              percentage: critRate,
            })}
          </div>
        ) : (
          <div
            css={{
              gridArea: `1 / 2 / ${weaponStats.weaponEffects.length + 2} / -1`,
              background: gray2,
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: gray6,
              fontWeight: 500,
            }}
          >
            {t('DOES_NOT_CRIT')}
          </div>
        )}
        {weaponEffectSummaries.map(effect => {
          return (
            <React.Fragment key={effect.id}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <img
                  src={weaponEffectToIconUrl(effect.type)}
                  css={{ height: 16, width: 16, marginRight: 8 }}
                />
                {effect.nonCrit.min !== null && `${effect.nonCrit.min}-`}
                {effect.nonCrit.max}
              </div>
              {effect.crit && (
                <div
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={weaponEffectToIconUrl(effect.type)}
                    css={{ height: 16, width: 16, marginRight: 8 }}
                  />
                  {effect.crit.min !== null && `${effect.crit.min}-`}
                  {effect.crit.max}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <Divider css={{ margin: '12px 0' }} />
      <div css={{ fontWeight: 500 }}>
        <div>
          {t('AVERAGE_DAMAGE')}: {weightedAverageDamage.toFixed(0)}
        </div>
        {!!weightedAverageHeal && (
          <div>
            {t('AVERAGE_HEAL')}: {weightedAverageHeal.toFixed(0)}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeaponDamage;
