/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import {
  classById_classById_spellVariantPairs_spells,
  classById_classById_spellVariantPairs_spells_spellStats,
} from 'graphql/queries/__generated__/classById';
import { Radio, Tooltip, Divider, Switch } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import {
  CardTitleWithLevel,
  damageHeaderStyle,
  EffectLine,
} from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { useTranslation } from 'i18n';
import {
  getStatWithDefault,
  getSimpleEffect,
  calcEffect,
  getStatsFromCustomSet,
} from 'common/utils';
import { TEffectLine } from 'common/types';
import { Stat } from '__generated__/globalTypes';
import { mq } from 'common/constants';
import { Media } from './Media';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFistRaised,
  faPeopleArrows,
} from '@fortawesome/free-solid-svg-icons';
import Card from 'components/common/Card';

interface IProps {
  customSet?: customSet | null;
  spell: classById_classById_spellVariantPairs_spells;
}

const SpellCard: React.FC<IProps> = ({ spell, customSet }) => {
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

  const spellStats:
    | classById_classById_spellVariantPairs_spells_spellStats
    | undefined = spell.spellStats[selectedSpellLevelIdx];

  const rangedOnly = spellStats?.minRange && spellStats?.minRange > 1;
  const meleeOnly = !spellStats?.maxRange || spellStats?.maxRange <= 1;

  const [showRanged, setShowRanged] = React.useState(
    meleeOnly || !statsFromCustomSet
      ? false
      : getStatWithDefault(statsFromCustomSet, Stat.PCT_RANGED_DAMAGE) >=
          getStatWithDefault(statsFromCustomSet, Stat.PCT_MELEE_DAMAGE),
  );

  const damageTypeKey = showRanged ? 'ranged' : 'melee';

  const showToggle =
    !rangedOnly &&
    !meleeOnly &&
    spellStats.spellEffects.some(
      effect => getSimpleEffect(effect.effectType) === 'damage',
    );

  let content = null;

  const onChange = React.useCallback(
    (e: RadioChangeEvent) => {
      selectSpellLevelIdx(e.target.value);
    },
    [selectSpellLevelIdx],
  );

  const theme = useTheme<TTheme>();

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

    const toggleSwitch = (
      <Switch
        checked={showRanged}
        onChange={setShowRanged}
        css={{
          background: theme.switch?.background,
        }}
        checkedChildren={<FontAwesomeIcon icon={faPeopleArrows} />}
        unCheckedChildren={<FontAwesomeIcon icon={faFistRaised} />}
      />
    );

    content = (
      <>
        <div>
          <img
            src={spell.imageUrl}
            css={{ float: 'right', width: 40, marginLeft: 8, marginBottom: 8 }}
          />
          {spell.description
            .split('•')
            .map((chunk, idx) =>
              idx === 0 ? (
                <div key={idx}>{chunk}</div>
              ) : (
                <li key={idx}>{`• ${chunk}`}</li>
              ),
            )}
        </div>
        {spellStats.spellEffects.length > 0 && (
          <>
            <Divider css={{ margin: '12px 0' }} />
            {showToggle && (
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
            )}
            <div css={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
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
                    gridArea: `1 / 2 / ${spellStats.spellEffects.length +
                      2} / -1`,
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
              {spellEffectSummaries.map(effect => {
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
                    <Radio.Button
                      key={idx}
                      value={idx}
                      disabled={idx > spellLevelIdx}
                    >
                      {idx + 1}
                    </Radio.Button>
                  );
                  return idx > spellLevelIdx ? (
                    <Tooltip
                      getPopupContainer={element => element.parentElement!}
                      key={idx}
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
        [':hover']: {
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
