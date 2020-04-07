/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import {
  CardTitleWithLevel,
  damageHeaderStyle,
  EffectLine,
} from 'common/wrappers';
// import { useTranslation } from 'i18n';
import { itemCardStyle, BORDER_COLOR, gray2, gray6 } from 'common/mixins';
import { item_weaponStats } from 'graphql/fragments/__generated__/item';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import {
  getStatsFromCustomSet,
  getStatWithDefault,
  getSimpleEffect,
  calcEffect,
  calcElementMage,
  elementMageToWeaponEffect,
} from 'common/utils';
import { StatsFromCustomSet, TEffectLine } from 'common/types';
import {
  Stat,
  WeaponElementMage,
  WeaponEffectType,
} from '__generated__/globalTypes';
import { useTranslation } from 'i18n';
import Divider from 'antd/lib/divider';

interface IProps {
  weaponStats: item_weaponStats;
  customSet: customSet;
  weaponElementMage: WeaponElementMage | null;
}

const WeaponDamage: React.FC<IProps> = ({
  weaponStats,
  customSet,
  weaponElementMage,
}) => {
  const { t } = useTranslation(['weapon_spell_effect', 'stat']);
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
  let critRate =
    typeof weaponStats.baseCritChance === 'number'
      ? getStatWithDefault(statsFromCustomSet, Stat.CRITICAL) +
        weaponStats.baseCritChance
      : null;
  critRate = critRate === null ? null : Math.min(Math.max(critRate, 0), 100);

  const weaponEffectSummaries: Array<TEffectLine> = weaponStats.weaponEffects.map(
    ({ minDamage, maxDamage, effectType, id }) => {
      let min = minDamage,
        max = maxDamage,
        type = effectType;
      if (type === WeaponEffectType.NEUTRAL_DAMAGE && weaponElementMage) {
        ({ minDamage: min, maxDamage: max } = calcElementMage(
          weaponElementMage,
          min || max,
          max,
        ));
        type = elementMageToWeaponEffect(weaponElementMage);
      }
      return {
        id,
        type,
        nonCrit: {
          min: min
            ? calcEffect(
                min,
                type,
                customSet.level,
                statsFromCustomSet,
                { isWeapon: true },
                damageTypeKey,
                weaponSkillPower,
              )
            : null,
          max: calcEffect(
            max,
            type,
            customSet.level,
            statsFromCustomSet,
            { isWeapon: true },
            damageTypeKey,
            weaponSkillPower,
          ),
          baseMax: max,
        },
        crit:
          weaponStats.baseCritChance === null ||
          weaponStats.critBonusDamage === null
            ? null
            : {
                min: min
                  ? calcEffect(
                      min +
                        (getSimpleEffect(type) === 'damage' ||
                        getSimpleEffect(type) === 'heal'
                          ? 0
                          : weaponStats.critBonusDamage),
                      type,
                      customSet.level,
                      statsFromCustomSet,
                      { isWeapon: true, isCrit: true },
                      damageTypeKey,
                      weaponSkillPower,
                    )
                  : null,
                max: calcEffect(
                  max +
                    (getSimpleEffect(type) === 'damage' ||
                    getSimpleEffect(type) === 'heal'
                      ? 0
                      : weaponStats.critBonusDamage),
                  type,
                  customSet.level,
                  statsFromCustomSet,
                  { isWeapon: true, isCrit: true },
                  damageTypeKey,
                  weaponSkillPower,
                ),
                baseMax:
                  max +
                  (getSimpleEffect(type) === 'damage' ||
                  getSimpleEffect(type) === 'heal'
                    ? 0
                    : weaponStats.critBonusDamage),
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
      title={<CardTitleWithLevel title={t('WEAPON_DAMAGE')} />}
      css={{
        ...itemCardStyle,
        [':hover']: {
          border: `1px solid ${BORDER_COLOR}`,
        },
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <Radio.Group value={weaponSkillPower} onChange={onWeaponSkillChange}>
        <Radio value={0} css={{ fontSize: '0.75rem' }}>
          {t('NO_WEAPON_SKILL')}
        </Radio>
        <Radio value={300} css={{ fontSize: '0.75rem' }}>
          {t('WEAPON_SKILL')} (300 {t('POWER', { ns: 'stat' })})
        </Radio>
        <Radio value={350} css={{ fontSize: '0.75rem' }}>
          {t('WEAPON_SKILL')} (350 {t('POWER', { ns: 'stat' })})
        </Radio>
      </Radio.Group>
      <Divider css={{ margin: '12px 0' }} />
      <div css={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div css={damageHeaderStyle}>{t('NON_CRIT')}</div>
        {weaponStats.baseCritChance ? (
          <div css={damageHeaderStyle}>
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
              <EffectLine
                min={effect.nonCrit.min}
                max={effect.nonCrit.max}
                effectType={effect.type}
                baseMax={effect.nonCrit.baseMax}
              />
              {!!effect.crit && (
                <EffectLine
                  min={effect.crit.min}
                  max={effect.crit.max}
                  effectType={effect.type}
                  baseMax={effect.crit.baseMax}
                />
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
