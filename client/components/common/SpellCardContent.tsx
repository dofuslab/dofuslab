/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Divider, notification } from 'antd';
import { useTheme } from 'emotion-theming';

import {
  damageHeaderStyle,
  EffectLine,
  DamageTypeToggle,
} from 'common/wrappers';
import { useTranslation } from 'i18n';
import {
  getStatWithDefault,
  getSimpleEffect,
  calcEffect,
  getStatsFromCustomSet,
  getInitialRangedState,
} from 'common/utils';
import { TEffectLine, Theme } from 'common/types';
import { Stat } from '__generated__/globalTypes';
import { CustomSet, Spell, SpellStats } from 'common/type-aliases';

interface Props {
  customSet?: CustomSet | null;
  spell: Spell;
  selectedSpellLevelIdx: number;
}

const SpellCardContent: React.FC<Props> = ({
  spell,
  customSet,
  selectedSpellLevelIdx,
}) => {
  const { t } = useTranslation(['weapon_spell_effect', 'stat', 'common']);
  const customSetLevel = customSet?.level || 200;

  const statsFromCustomSet = getStatsFromCustomSet(customSet);

  const spellStats: SpellStats | undefined =
    spell.spellStats[selectedSpellLevelIdx];

  const rangedOnly = !!spellStats?.minRange && spellStats?.minRange > 1;
  const meleeOnly = !spellStats?.maxRange || spellStats?.maxRange <= 1;

  const [showRanged, setShowRanged] = React.useState(
    getInitialRangedState(meleeOnly, rangedOnly, statsFromCustomSet),
  );

  const [baseDamageIncreases, setBaseDamageIncreases] = React.useState<
    Array<number>
  >([]);

  const totalDamageIncrease = baseDamageIncreases.reduce(
    (acc, curr) => acc + curr,
    0,
  );

  const damageTypeKey = showRanged ? 'ranged' : 'melee';

  const showToggle =
    !rangedOnly &&
    !meleeOnly &&
    spellStats.spellEffects.some(
      (effect) => getSimpleEffect(effect.effectType) === 'damage',
    );

  let content = null;

  const theme = useTheme<Theme>();

  const addDamageIncrease = React.useCallback(
    (damageIncrease: number) => {
      if (
        !spellStats.spellDamageIncrease ||
        (spellStats.spellDamageIncrease.maxStacks &&
          baseDamageIncreases.length >=
            spellStats.spellDamageIncrease.maxStacks)
      ) {
        notification.error({
          message: t('ERROR', { ns: 'common' }),
          description: t('MAX_STACKS_APPLIED'),
        });
        return;
      }
      setBaseDamageIncreases((prevIncreases) => [
        ...prevIncreases,
        damageIncrease,
      ]);
    },
    [baseDamageIncreases, spellStats],
  );

  const removeDamageIncrease = React.useCallback(
    (damageIncreaseIdx: number) => {
      setBaseDamageIncreases((prevIncreases) =>
        prevIncreases.filter((_, idx) => idx !== damageIncreaseIdx),
      );
    },
    [],
  );

  if (!spellStats) {
    content = (
      <div>{t('UNAVAILABLE_SPELL', { level: spell.spellStats[0].level })}</div>
    );
  } else {
    const spellEffectSummaries: Array<TEffectLine> = spellStats.spellEffects.map(
      ({
        minDamage,
        maxDamage,
        effectType,
        id,
        critMinDamage,
        critMaxDamage,
      }) => {
        return {
          id,
          type: effectType,
          nonCrit: {
            min: minDamage
              ? calcEffect(
                  minDamage + totalDamageIncrease,
                  effectType,
                  customSetLevel,
                  statsFromCustomSet,
                  { isTrap: spell.isTrap },
                  damageTypeKey,
                )
              : null,
            max: calcEffect(
              maxDamage + totalDamageIncrease,
              effectType,
              customSetLevel,
              statsFromCustomSet,
              { isTrap: spell.isTrap },
              damageTypeKey,
            ),
            baseMax: maxDamage,
          },
          crit:
            spellStats.baseCritChance === null || !critMaxDamage
              ? null
              : {
                  min: critMinDamage
                    ? calcEffect(
                        critMinDamage + totalDamageIncrease,
                        effectType,
                        customSetLevel,
                        statsFromCustomSet,
                        { isCrit: true, isTrap: spell.isTrap },
                        damageTypeKey,
                      )
                    : null,
                  max: calcEffect(
                    critMaxDamage + totalDamageIncrease,
                    effectType,
                    customSetLevel,
                    statsFromCustomSet,
                    { isCrit: true, isTrap: spell.isTrap },
                    damageTypeKey,
                  ),
                  baseMax: critMaxDamage,
                },
        };
      },
    );

    let critRate =
      typeof spellStats.baseCritChance === 'number'
        ? getStatWithDefault(statsFromCustomSet, Stat.CRITICAL) +
          spellStats?.baseCritChance
        : null;
    critRate = critRate === null ? null : Math.min(Math.max(critRate, 0), 100);

    const spellCharacteristics = [
      `${spellStats.apCost}\u00A0${t('AP', { ns: 'stat' })}`,
    ];

    if (spellStats.maxRange) {
      let rangeString = `${
        spellStats.minRange && spellStats.minRange !== spellStats.maxRange
          ? `${spellStats.minRange}-${spellStats.maxRange}\u00A0${t('RANGE', {
              ns: 'stat',
            })}`
          : `${spellStats.maxRange}\u00A0${t('RANGE', { ns: 'stat' })}`
      }`;

      if (spellStats.hasModifiableRange) {
        rangeString = `${rangeString} (${t('MODIFIABLE')})`;
      }

      spellCharacteristics.push(rangeString);
    }

    if (spellStats.isLinear) {
      spellCharacteristics.push(t('LINEAR'));
    }

    if (!spellStats.needsLos) {
      spellCharacteristics.push(t('NO_LOS'));
    }

    if (spellStats.castsPerTarget) {
      spellCharacteristics.push(
        t('CAST_PER_TARGET', { count: spellStats.castsPerTarget }),
      );
    }

    if (spellStats.castsPerTurn) {
      spellCharacteristics.push(
        t('CAST_PER_TURN', { count: spellStats.castsPerTurn }),
      );
    }

    if (spellStats.cooldown) {
      spellCharacteristics.push(t('COOLDOWN', { count: spellStats.cooldown }));
    }

    content = (
      <>
        <div>
          <img
            src={spell.imageUrl}
            css={{ float: 'right', width: 40, marginLeft: 8, marginBottom: 8 }}
            alt={spell.name}
          />
          {spell.description.split('•').map((chunk, idx) =>
            idx === 0 ? (
              /* eslint-disable react/no-array-index-key */
              <div key={idx}>{chunk}</div>
            ) : (
              <li key={idx}>{`• ${chunk}`}</li>
              /* eslint-enable react/no-array-index-key */
            ),
          )}
        </div>
        {baseDamageIncreases.length > 0 && (
          <>
            <Divider css={{ margin: '12px 0' }} />
            {baseDamageIncreases.map((increase, idx) => (
              /* eslint-disable react/no-array-index-key */
              <a
                key={`increase-${idx}`}
                onClick={() => {
                  removeDamageIncrease(idx);
                }}
                css={{ display: 'block' }}
              >
                {t('INCREASE_BASE_DAMAGE', { damageIncrease: increase })}
              </a>
              /* eslint-enable react/no-array-index-key */
            ))}
          </>
        )}
        {spellStats.spellEffects.length > 0 && (
          <>
            <Divider css={{ margin: '12px 0' }} />
            {showToggle && (
              <DamageTypeToggle
                setShowRanged={setShowRanged}
                showRanged={showRanged}
              />
            )}
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridColumnGap: 8,
              }}
            >
              <div css={damageHeaderStyle}>{t('NON_CRIT')}</div>
              {spellStats.baseCritChance ? (
                <div css={damageHeaderStyle}>
                  {t('CRIT_WITH_PERCENTAGE', {
                    percentage: critRate,
                  })}
                </div>
              ) : (
                <div
                  css={{
                    gridArea: `1 / 2 / ${
                      spellStats.spellEffects.length +
                      2 +
                      (spellStats.spellDamageIncrease ? 1 : 0)
                    } / -1`,
                    background: theme.damage?.nonCrit?.background,
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: theme.damage?.nonCrit?.color,
                    fontWeight: 500,
                    padding: 8,
                    textAlign: 'center',
                  }}
                >
                  {t('DOES_NOT_CRIT')}
                </div>
              )}
              {spellEffectSummaries.map((effect) => {
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
              {!!spellStats.spellDamageIncrease && (
                <>
                  <a
                    onClick={() => {
                      if (!spellStats.spellDamageIncrease) {
                        return;
                      }
                      addDamageIncrease(
                        spellStats.spellDamageIncrease.baseIncrease,
                      );
                    }}
                  >
                    {t('INCREASE_BASE_DAMAGE', {
                      damageIncrease:
                        spellStats.spellDamageIncrease.baseIncrease,
                    })}
                  </a>
                  {!!spellStats.spellDamageIncrease.critBaseIncrease && (
                    <a
                      onClick={() => {
                        if (!spellStats.spellDamageIncrease?.critBaseIncrease) {
                          return;
                        }
                        addDamageIncrease(
                          spellStats.spellDamageIncrease.critBaseIncrease,
                        );
                      }}
                    >
                      {t('INCREASE_BASE_DAMAGE', {
                        damageIncrease:
                          spellStats.spellDamageIncrease.critBaseIncrease,
                      })}
                    </a>
                  )}
                </>
              )}
            </div>
          </>
        )}
        <Divider css={{ margin: '12px 0' }} />
        {spellCharacteristics.join(' • ')}
      </>
    );
  }

  return content;
};

export default SpellCardContent;
