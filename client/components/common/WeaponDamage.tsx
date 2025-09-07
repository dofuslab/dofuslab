/** @jsxImportSource @emotion/react */

import React from 'react';
import { Divider, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from '@emotion/react';

import { TEffectLine } from 'common/types';
import {
  CardTitleWithLevel,
  damageHeaderStyle,
  EffectLine,
  DamageTypeToggle,
  TotalDamageLine,
} from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import {
  getStatWithDefault,
  getSimpleEffect,
  calcEffect,
  calcElementMage,
  elementMageToWeaponEffect,
  getInitialRangedState,
  getTotalDamage,
  getWeightedAverages,
  CustomSetContext,
  calcEffectType,
} from 'common/utils';

import {
  Stat,
  WeaponElementMage,
  WeaponEffectType,
} from '__generated__/globalTypes';
import { useTranslation } from 'next-i18next';
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
  const { statsFromCustomSetWithBuffs } = React.useContext(CustomSetContext);
  const { t } = useTranslation(['weapon_spell_effect', 'stat']);
  const [weaponSkillPower, setWeaponSkillPower] = React.useState(300);

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

  const [showRanged, setShowRanged] = React.useState(
    getInitialRangedState(meleeOnly, rangedOnly, statsFromCustomSetWithBuffs),
  );

  const damageTypeKey = showRanged ? 'ranged' : 'melee';
  let critRate =
    typeof weaponStats.baseCritChance === 'number'
      ? getStatWithDefault(statsFromCustomSetWithBuffs, Stat.CRITICAL) +
        weaponStats.baseCritChance
      : null;
  critRate = critRate === null ? null : Math.min(Math.max(critRate, 0), 100);

  const weaponEffectSummaries: Array<TEffectLine> =
    weaponStats.weaponEffects.map(
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
                  statsFromCustomSetWithBuffs,
                  { isWeapon: true },
                  damageTypeKey,
                  weaponSkillPower,
                )
              : null,
            max: calcEffect(
              max,
              type,
              customSet.level,
              statsFromCustomSetWithBuffs,
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
                        statsFromCustomSetWithBuffs,
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
                    statsFromCustomSetWithBuffs,
                    { isWeapon: true, isCrit: true },
                    damageTypeKey,
                    weaponSkillPower,
                  ),
                  baseMax:
                    getSimpleEffect(type) === 'pushback_damage'
                      ? max
                      : max +
                        (getSimpleEffect(type) === 'damage' ||
                        getSimpleEffect(type) === 'heal'
                          ? 0
                          : weaponStats.critBonusDamage),
                },
        };
      },
    );

  const { weightedAverageDamage, weightedAverageHeal } = getWeightedAverages(
    weaponEffectSummaries,
    critRate,
  );

  const totalDamage = getTotalDamage(weaponEffectSummaries);

  const healLines = weaponEffectSummaries.filter(
    (e) => getSimpleEffect(e.type) === 'heal',
  );

  const totalHeal =
    healLines.length > 0
      ? {
          nonCrit: {
            min: healLines.reduce(
              (acc, curr) => acc + (curr.nonCrit.min || curr.nonCrit.max),
              0,
            ),
            max: healLines.reduce((acc, curr) => acc + curr.nonCrit.max, 0),
          },
          crit: {
            min: healLines.reduce(
              (acc, curr) => acc + ((curr.crit?.min || curr.crit?.max) ?? 0),
              0,
            ),
            max: healLines.reduce(
              (acc, curr) => acc + (curr.crit?.max ?? 0),
              0,
            ),
          },
        }
      : null;

  const pushbackDamageLines = weaponEffectSummaries.filter(
    (e) => getSimpleEffect(e.type) === 'pushback_damage',
  );

  const totalPushbackDamage =
    pushbackDamageLines.length > 0
      ? {
          nonCrit: {
            min: pushbackDamageLines.reduce(
              (acc, curr) => acc + (curr.nonCrit.min || curr.nonCrit.max),
              0,
            ),
            max: pushbackDamageLines.reduce(
              (acc, curr) => acc + curr.nonCrit.max,
              0,
            ),
          },
          crit: {
            min: pushbackDamageLines.reduce(
              (acc, curr) => acc + ((curr.crit?.min || curr.crit?.max) ?? 0),
              0,
            ),
            max: pushbackDamageLines.reduce(
              (acc, curr) => acc + (curr.crit?.max ?? 0),
              0,
            ),
          },
        }
      : null;

  const theme = useTheme();

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
        <Radio value={0} css={{ fontSize: '0.75rem', display: 'block' }}>
          {t('NO_WEAPON_SKILL')}
        </Radio>
        <Radio value={300} css={{ fontSize: '0.75rem', display: 'block' }}>
          {t('WEAPON_SKILL')} (300 {t('POWER', { ns: 'stat' })})
        </Radio>
        <Radio value={350} css={{ fontSize: '0.75rem', display: 'block' }}>
          {t('WEAPON_SKILL')} (350 {t('POWER', { ns: 'stat' })})
        </Radio>
      </Radio.Group>
      <Divider css={{ margin: '12px 0' }} />
      <DamageTypeToggle
        setShowRanged={setShowRanged}
        showRanged={showRanged}
        rangedOnly={rangedOnly}
        meleeOnly={meleeOnly}
      />
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
              effectType={calcEffectType(
                effect.type,
                statsFromCustomSetWithBuffs,
              )}
              baseMax={effect.nonCrit.baseMax}
            />
            {!!effect.crit && (
              <EffectLine
                min={effect.crit.min}
                max={effect.crit.max}
                effectType={calcEffectType(
                  effect.type,
                  statsFromCustomSetWithBuffs,
                )}
                baseMax={effect.crit.baseMax}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <Divider css={{ margin: '12px 0' }} />
      <div css={damageHeaderStyle}>{t('TOTAL')}</div>
      <TotalDamageLine
        totalObj={totalDamage}
        imageUrl="icon/Weapon_Damage.svg"
        imageAlt={t('DAMAGE')}
      />
      {totalHeal && (
        <TotalDamageLine
          totalObj={totalHeal}
          imageUrl="icon/Health_Point.svg"
          imageAlt={t('HEAL')}
        />
      )}
      {totalPushbackDamage && (
        <TotalDamageLine
          totalObj={totalPushbackDamage}
          imageUrl="icon/Pushback_Damage.svg"
          imageAlt={t('PUSHBACK_DAMAGE')}
        />
      )}
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
