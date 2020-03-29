/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { item, item_set } from 'graphql/fragments/__generated__/item';
import { customSet_equippedItems_exos } from 'graphql/fragments/__generated__/customSet';
import { useTranslation } from 'i18n';
import { blue6 } from 'common/mixins';
import { Effect, Stat } from '__generated__/globalTypes';
import Divider from 'antd/lib/divider';

interface IProps {
  readonly item: item;
  readonly className?: string;
  readonly exos?: ReadonlyArray<customSet_equippedItems_exos> | null;
  readonly hideSet?: boolean;
  readonly openSetModal?: (set: item_set) => void;
  readonly showImg?: boolean;
}

const weaponEffectToIconUrl = (effect: Effect) => {
  switch (effect) {
    case Effect.AIR_DAMAGE:
    case Effect.AIR_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Agility.svg';
    case Effect.EARTH_DAMAGE:
    case Effect.EARTH_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Strength.svg';
    case Effect.FIRE_DAMAGE:
    case Effect.FIRE_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Intelligence.svg';
    case Effect.NEUTRAL_DAMAGE:
    case Effect.NEUTRAL_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral.svg';
    case Effect.WATER_DAMAGE:
    case Effect.WATER_STEAL:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Chance.svg';
    case Effect.AP:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Action_Point.svg';
    case Effect.MP:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Movement_Point.svg';
    case Effect.HP_RESTORED:
      return 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Health_Point.svg';
  }
};

const renderConditions = (conditionsObj: any, depth = 0) => {
  if (!conditionsObj || Object.keys(conditionsObj).length === 0) {
    return null;
  }
  if (conditionsObj.stat) {
    return `${conditionsObj.stat}\u00A0${conditionsObj.operator}\u00A0${conditionsObj.value}`;
  }
  if (conditionsObj.and && conditionsObj.and.length === 1) {
    const condition = conditionsObj.and[0];
    return `${condition.stat} ${condition.operator} ${condition.value}`;
  } else if (conditionsObj.or && conditionsObj.or.length === 1) {
    const condition = conditionsObj.or[0];
    return `${condition.stat} ${condition.operator} ${condition.value}`;
  }

  if (conditionsObj.and) {
    const result = conditionsObj.and
      .map((nestedObj: any) => renderConditions(nestedObj, depth + 1))
      .join(' and ');
    return depth > 0 ? `(${result})` : result;
  }

  if (conditionsObj.or) {
    const result = conditionsObj.or
      .map((nestedObj: any) => renderConditions(nestedObj, depth + 1))
      .join(' or ');
    return depth > 0 ? `(${result})` : result;
  }

  throw new Error('Unknown conditions object');
};

const ItemStatsList: React.FC<IProps> = ({
  item,
  className,
  exos,
  openSetModal,
  showImg,
}) => {
  const { t } = useTranslation(['stat', 'weapon_stat']);

  const statsMap: {
    [key: string]: { value: number; maged: boolean };
  } = item.stats.reduce(
    (acc, { stat, maxValue }) =>
      stat ? { ...acc, [stat]: { value: maxValue, maged: false } } : acc,
    {},
  );

  let exoStatsMap: { [key: string]: number } = {};

  if (exos) {
    exoStatsMap = exos.reduce(
      (acc, { stat, value }) => ({ ...acc, [stat]: value }),
      {},
    );

    Object.entries(exoStatsMap).forEach(([stat, value]) => {
      if (statsMap[stat]) {
        statsMap[stat].value += value;
        statsMap[stat].maged = true;
        delete exoStatsMap[stat];
      }
    });
  }

  const onOpenModal = React.useCallback(() => {
    if (!item.set || !openSetModal) {
      return;
    }
    openSetModal(item.set);
  }, [openSetModal, item]);

  const conditions = JSON.parse(item.conditions);

  return (
    <div>
      {item.set && (
        <div
          css={{ marginBottom: 12, fontSize: '0.75rem' }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
          }}
        >
          {openSetModal ? (
            <a onClick={onOpenModal}>{item.set.name}</a>
          ) : (
            item.set.name
          )}
        </div>
      )}
      {showImg && (
        <img src={item.imageUrl} css={{ float: 'right', maxWidth: 84 }} />
      )}
      {item.weaponStats && (
        <>
          <div css={{ marginBottom: showImg ? 12 : 0 }}>
            {item.weaponStats.weaponEffects.map(effect => (
              <div
                key={`weapon-effect-${effect.id}`}
                css={{ display: 'flex', alignItems: 'center' }}
              >
                <img
                  src={weaponEffectToIconUrl(effect.effectType)}
                  css={{ height: 16, width: 16, marginRight: 8 }}
                />
                {effect.minDamage ? `${effect.minDamage}-` : ''}
                {effect.maxDamage} {t(effect.effectType, { ns: 'weapon_stat' })}
              </div>
            ))}
          </div>
          <Divider css={{ margin: '12px 0' }} />
        </>
      )}
      <ul
        className={className}
        css={{ paddingInlineStart: 16, fontSize: '0.75rem' }}
      >
        {item.stats.map((statLine, idx) => (
          <li
            key={`stat-${idx}`}
            css={{
              color:
                statLine.stat && statsMap[statLine.stat].maged
                  ? blue6
                  : 'inherit',
            }}
          >
            {statLine.stat
              ? `${statsMap[statLine.stat].value} ${t(statLine.stat)}`
              : statLine.customStat}
          </li>
        ))}
        {exos &&
          exos
            .filter(({ stat }) => !!exoStatsMap[stat])
            .map(({ stat, value }) => (
              <li key={`exo-${stat}`} css={{ color: blue6 }}>
                {value} {t(stat)}
              </li>
            ))}
      </ul>
      {item.weaponStats && (
        <>
          <Divider css={{ margin: '12px 0' }} />
          <div>
            {item.weaponStats.apCost}&nbsp;{t(Stat.AP, { ns: 'stat' })} •{' '}
            {!!item.weaponStats.minRange && `${item.weaponStats.minRange}-`}
            {item.weaponStats.maxRange}&nbsp;{t(Stat.RANGE, { ns: 'stat' })} •{' '}
            {item.weaponStats.baseCritChance
              ? `${item.weaponStats.baseCritChance} ${t(Stat.CRITICAL, {
                  ns: 'stat',
                })}\u00A0(+${item.weaponStats.critBonusDamage})`
              : t('DOES_NOT_CRIT', { ns: 'weapon_stat' })}{' '}
            •{' '}
            {t('USES_PER_TURN', {
              ns: 'weapon_stat',
              count: item.weaponStats.usesPerTurn,
            })}{' '}
          </div>
        </>
      )}
      {conditions && Object.keys(conditions.conditions || {}).length > 0 && (
        <>
          <Divider css={{ margin: '12px 0' }} />
          <div>{renderConditions(conditions.conditions)}</div>
        </>
      )}
    </div>
  );
};

export default React.memo(ItemStatsList);
