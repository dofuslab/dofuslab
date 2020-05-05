/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Divider, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { Theme, StatsFromCustomSet, TEffectLine } from 'common/types';
import {
  CardTitleWithLevel,
  damageHeaderStyle,
  EffectLine,
  DamageTypeToggle,
} from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import {
  getStatsFromCustomSet,
  getStatWithDefault,
  getSimpleEffect,
  calcEffect,
  calcElementMage,
  elementMageToWeaponEffect,
  getInitialRangedState,
} from 'common/utils';

import {
  Stat,
  WeaponElementMage,
  WeaponEffectType,
} from '__generated__/globalTypes';
import { useTranslation } from 'i18n';
import Card from 'components/common/Card';
import { WeaponStats, CustomSet } from 'common/type-aliases';

interface Props {
  weaponStats: WeaponStats;
  customSet: CustomSet;
  weaponElementMage: WeaponElementMage | null;
}

const WeaponDamage: React.FC<Props> = ({
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

  const rangedOnly = !!weaponStats.minRange && weaponStats.minRange > 1;
  const meleeOnly =
    !rangedOnly &&
    !customSet.equippedItems.some(
      (equippedItem) => equippedItem.item.itemType.enName === 'Axe',
    );

  const showToggle = !rangedOnly && !meleeOnly;

  const [showRanged, setShowRanged] = React.useState(
    getInitialRangedState(meleeOnly, rangedOnly, statsFromCustomSet),
  );

  const damageTypeKey = showRanged ? 'ranged' : 'melee';
  let critRate =
    typeof weaponStats.baseCritChance === 'number'
      ? getStatWithDefault(statsFromCustomSet, Stat.CRITICAL) +
        weaponStats.baseCritChance
      : null;
  critRate = critRate === null ? null : Math.min(Math.max(critRate, 0), 100);

  const weaponEffectSummaries: Array<TEffectLine> = weaponStats.weaponEffects.map(
    ({ minDamage, maxDamage, effectType, id }) => {
      let min = minDamage;
      let max = maxDamage;
      let type = effectType;
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
                          ? weaponStats.critBonusDamage
                          : 0),
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
                      ? weaponStats.critBonusDamage
                      : 0),
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

  const theme = useTheme<Theme>();

  return (
    <Card
      size="small"
      title={<CardTitleWithLevel title={t('WEAPON_DAMAGE')} />}
      css={{
        ...itemCardStyle,
        ':hover': {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
      }}
    >
      <Radio.Group value={weaponSkillPower} onChange={onWeaponSkillChange}>
        <Radio value={0} css={{ fontSize: '0.75rem' }}>
          {t('NO_WEAPON_SKILL')}
        </Radio>
        <Radio value={300} css={{ fontSize: '0.75rem' }}>
          {t('WEAPON_SKILL')} (300
          {t('POWER', { ns: 'stat' })})
        </Radio>
        <Radio value={350} css={{ fontSize: '0.75rem' }}>
          {t('WEAPON_SKILL')} (350
          {t('POWER', { ns: 'stat' })})
        </Radio>
      </Radio.Group>
      <Divider css={{ margin: '12px 0' }} />
      {showToggle && (
        <DamageTypeToggle
          setShowRanged={setShowRanged}
          showRanged={showRanged}
        />
      )}
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
              background: theme.damage?.nonCrit?.background,
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: theme.damage?.nonCrit?.color,
              fontWeight: 500,
            }}
          >
            {t('DOES_NOT_CRIT')}
          </div>
        )}
        {weaponEffectSummaries.map((effect) => (
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
        ))}
      </div>
      <Divider css={{ margin: '12px 0' }} />
      <div css={{ fontWeight: 500 }}>
        <div>
          {t('AVERAGE_DAMAGE')}:{weightedAverageDamage.toFixed(0)}
        </div>
        {!!weightedAverageHeal && (
          <div>
            {t('AVERAGE_HEAL')}:{weightedAverageHeal.toFixed(0)}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeaponDamage;
