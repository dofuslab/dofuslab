/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Radio, Divider } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { Theme, TEffectLine } from 'common/types';
import {
  CardTitleWithLevel,
  damageHeaderStyle,
  EffectLine,
  DamageTypeToggle,
} from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import { useTranslation } from 'i18n';
import {
  getStatWithDefault,
  getSimpleEffect,
  calcEffect,
  getStatsFromCustomSet,
  getInitialRangedState,
} from 'common/utils';

import { Stat } from '__generated__/globalTypes';
import Card from 'components/common/Card';
import Tooltip from 'components/common/Tooltip';
import { Spell, CustomSet, SpellStats } from 'common/type-aliases';

interface Props {
  customSet?: CustomSet | null;
  spell: Spell;
}

const SpellCard: React.FC<Props> = ({ spell, customSet }) => {
  const { t } = useTranslation(['weapon_spell_effect', 'stat']);
  const customSetLevel = customSet?.level || 200;
  const spellLevelIdx = spell.spellStats.reduce((max, curr, idx) => {
    if (curr.level <= customSetLevel) {
      return idx;
    }
    return max;
  }, -1);
  const [selectedSpellLevelIdx, selectSpellLevelIdx] = React.useState<number>(
    spellLevelIdx,
  );

  const statsFromCustomSet = getStatsFromCustomSet(customSet);

  const spellStats: SpellStats | undefined =
    spell.spellStats[selectedSpellLevelIdx];

  const rangedOnly = !!spellStats?.minRange && spellStats?.minRange > 1;
  const meleeOnly = !spellStats?.maxRange || spellStats?.maxRange <= 1;

  const [showRanged, setShowRanged] = React.useState(
    getInitialRangedState(meleeOnly, rangedOnly, statsFromCustomSet),
  );

  const damageTypeKey = showRanged ? 'ranged' : 'melee';

  const showToggle =
    !rangedOnly &&
    !meleeOnly &&
    spellStats.spellEffects.some(
      (effect) => getSimpleEffect(effect.effectType) === 'damage',
    );

  let content = null;

  const onChange = React.useCallback(
    (e: RadioChangeEvent) => {
      selectSpellLevelIdx(e.target.value);
    },
    [selectSpellLevelIdx],
  );

  const theme = useTheme<Theme>();

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
      }) => ({
        id,
        type: effectType,
        nonCrit: {
          min: minDamage
            ? calcEffect(
                minDamage,
                effectType,
                customSetLevel,
                statsFromCustomSet,
                {},
                damageTypeKey,
              )
            : null,
          max: calcEffect(
            maxDamage,
            effectType,
            customSetLevel,
            statsFromCustomSet,
            {},
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
                      critMinDamage,
                      effectType,
                      customSetLevel,
                      statsFromCustomSet,
                      { isCrit: true },
                      damageTypeKey,
                    )
                  : null,
                max: calcEffect(
                  critMaxDamage,
                  effectType,
                  customSetLevel,
                  statsFromCustomSet,
                  { isCrit: true },
                  damageTypeKey,
                ),
                baseMax: critMaxDamage,
              },
      }),
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
            css={{
              float: 'right',
              width: 40,
              marginLeft: 8,
              marginBottom: 8,
            }}
            alt={spell.name}
          />
          {spell.description.split('•').map((chunk, idx) =>
            idx === 0 ? (
              // eslint-disable-next-line react/no-array-index-key
              <div key={idx}>{chunk}</div>
            ) : (
              // eslint-disable-next-line react/no-array-index-key
              <li key={idx}>{`• ${chunk}`}</li>
            ),
          )}
        </div>
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
                      spellStats.spellEffects.length + 2
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
              {spellEffectSummaries.map((effect) => (
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
          </>
        )}
        <Divider css={{ margin: '12px 0' }} />
        {spellCharacteristics.join(' • ')}
      </>
    );
  }

  return (
    <Card
      key={spell.id}
      size="small"
      title={
        <CardTitleWithLevel
          title={spell.name}
          rightAlignedContent={
            <Radio.Group
              value={selectedSpellLevelIdx}
              onChange={onChange}
              size="small"
            >
              {Array(spell.spellStats.length)
                .fill(null)
                .map((_, idx) => {
                  const button = (
                    <Radio.Button value={idx} disabled={idx > spellLevelIdx}>
                      {idx + 1}
                    </Radio.Button>
                  );
                  return idx > spellLevelIdx ? (
                    <Tooltip
                      getPopupContainer={(element) => {
                        if (element.parentElement) {
                          return element.parentElement;
                        }
                        return document && document.body;
                      }}
                      // eslint-disable-next-line react/no-array-index-key
                      key={`spell-${spell.id}-${idx}`}
                      title={t('AVAILABLE_AT_LEVEL', {
                        level: spell.spellStats[idx].level,
                      })}
                    >
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
            </Radio.Group>
          }
        />
      }
      css={{
        ...itemCardStyle,
        ':hover': {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
      }}
    >
      {content}
    </Card>
  );
};

export default SpellCard;
