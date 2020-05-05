/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { item, item_set } from 'graphql/fragments/__generated__/item';
import { customSet_equippedItems_exos } from 'graphql/fragments/__generated__/customSet';
import { useTranslation } from 'i18n';
import { Stat, WeaponElementMage } from '__generated__/globalTypes';
import { Divider } from 'antd';
import { WeaponEffectsList, BrokenImagePlaceholder } from 'common/wrappers';
import { TFunction } from 'next-i18next';
import { BuildError } from 'common/types';
import { renderErrors } from 'common/utils';
import { TTheme } from 'common/themes';

interface Props {
  readonly item: item;
  readonly className?: string;
  readonly exos?: ReadonlyArray<customSet_equippedItems_exos> | null;
  readonly hideSet?: boolean;
  readonly openSetModal?: (set: item_set) => void;
  readonly showImg?: boolean;
  readonly showOnlyWeaponStats?: boolean;
  readonly weaponElementMage?: WeaponElementMage | null;
  readonly errors?: Array<BuildError>;
}

const renderConditions = (conditionsObj: any, t: TFunction, depth = 0) => {
  try {
    if (!conditionsObj || Object.keys(conditionsObj).length === 0) {
      return null;
    }
    if (conditionsObj.stat) {
      return `${t(conditionsObj.stat)}\u00A0${conditionsObj.operator}\u00A0${
        conditionsObj.value
      }`;
    }
    if (conditionsObj.and && conditionsObj.and.length === 1) {
      const condition = conditionsObj.and[0];
      return `${t(condition.stat)} ${condition.operator} ${condition.value}`;
    }
    if (conditionsObj.or && conditionsObj.or.length === 1) {
      const condition = conditionsObj.or[0];
      return `${t(condition.stat)} ${condition.operator} ${condition.value}`;
    }

    if (conditionsObj.and) {
      const result = conditionsObj.and
        .map((nestedObj: any) => renderConditions(nestedObj, t, depth + 1))
        .join(` ${t('CONDITIONS.AND')} `);
      return depth > 0 ? `(${result})` : result;
    }

    if (conditionsObj.or) {
      const result = conditionsObj.or
        .map((nestedObj: any) => renderConditions(nestedObj, t, depth + 1))
        .join(` ${t('CONDITIONS.OR')} `);
      return depth > 0 ? `(${result})` : result;
    }
    throw new Error('Unknown conditions object');
  } catch (e) {
    console.error('Error parsing conditions object:', e);
  }

  return null;
};

const ItemStatsList: React.FC<Props> = ({
  item,
  className,
  exos,
  openSetModal,
  showImg,
  showOnlyWeaponStats,
  weaponElementMage,
  errors,
}) => {
  const { t, i18n } = useTranslation(['stat', 'weapon_spell_effect', 'common']);
  const theme = useTheme<TTheme>();

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

  const onOpenModal = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation();
      if (!item.set || !openSetModal) {
        return;
      }
      openSetModal(item.set);
    },
    [openSetModal, item],
  );

  const conditions = JSON.parse(item.conditions);

  const [brokenImage, setBrokenImage] = React.useState(false);

  return (
    <div>
      {item.set && (
        <div css={{ marginBottom: 12, fontSize: '0.75rem' }}>
          {openSetModal ? (
            <a onClick={onOpenModal}>{item.set.name}</a>
          ) : (
            item.set.name
          )}
        </div>
      )}
      {showImg &&
        (brokenImage ? (
          <BrokenImagePlaceholder
            css={{ float: 'right', maxWidth: 84, fontSize: '1.2rem' }}
          />
        ) : (
          <img
            src={item.imageUrl}
            css={{ float: 'right', maxWidth: 84 }}
            onError={() => {
              setBrokenImage(true);
            }}
          />
        ))}
      {item.weaponStats && (
        <>
          <WeaponEffectsList
            weaponStats={item.weaponStats}
            css={{ marginBottom: showImg ? 12 : 0 }}
            elementMage={weaponElementMage}
          />
          <Divider css={{ margin: '12px 0' }} />
        </>
      )}
      {!showOnlyWeaponStats && (
        <ul
          className={className}
          css={{ paddingInlineStart: 16, fontSize: '0.75rem' }}
        >
          {item.stats
            .sort(({ order: i }, { order: j }) => i - j)
            .map((statLine, idx) => (
              <li key={`stat-${idx}`}>
                <span
                  css={{
                    color:
                      statLine.stat && statsMap[statLine.stat].maged
                        ? theme.text?.primary
                        : statLine.maxValue && statLine.maxValue < 0
                          ? theme.text?.danger
                          : 'inherit',
                  }}
                >
                  {statLine.stat
                    ? `${statsMap[statLine.stat].value} ${t(statLine.stat)}`
                    : statLine.customStat}
                </span>
              </li>
            ))}
          {exos &&
            exos
              .filter(({ stat }) => !!exoStatsMap[stat])
              .map(({ stat, value }) => (
                <li key={`exo-${stat}`}>
                  <span css={{ color: theme.text?.primary }}>
                    {value}
                    {' '}
                    {t(stat)}
                  </span>
                </li>
              ))}
        </ul>
      )}
      {item.weaponStats && (
        <>
          {!showOnlyWeaponStats && <Divider css={{ margin: '12px 0' }} />}
          <div>
            {item.weaponStats.apCost}
            &nbsp;
            {t(Stat.AP, { ns: 'stat' })}
            {' '}
            •
            {' '}
            {!!item.weaponStats.minRange && `${item.weaponStats.minRange}-`}
            {item.weaponStats.maxRange}
            &nbsp;
            {t(Stat.RANGE, { ns: 'stat' })}
            {' '}
            •
            {' '}
            {item.weaponStats.baseCritChance
              ? `${item.weaponStats.baseCritChance} ${t(Stat.CRITICAL, {
                ns: 'stat',
              })}\u00A0(+${item.weaponStats.critBonusDamage})`
              : t('DOES_NOT_CRIT', { ns: 'weapon_spell_effect' })}
            {' '}
            •
            {' '}
            {t('USE_PER_TURN', {
              ns: 'weapon_spell_effect',
              count: item.weaponStats.usesPerTurn,
            })}
            {' '}
          </div>
        </>
      )}
      {conditions &&
        (Object.keys(conditions.conditions || {}).length > 0 ||
          Object.keys(conditions.customConditions || {}).length > 0) && (
          <>
          <Divider css={{ margin: '12px 0' }} />
          {Object.keys(conditions.conditions || {}).length > 0 && (
            <div>{renderConditions(conditions.conditions, t)}</div>
          )}
          {Object.keys(conditions.customConditions || {}).length > 0 && (
            <div>
              {conditions.customConditions?.[i18n.language]?.join(
                  ` ${t('CONDITIONS.AND')} `,
                )}
            </div>
          )}
        </>
      )}
      {errors && errors.length > 0 && (
        <>
          <Divider css={{ margin: '12px 0' }} />
          <ul css={{ margin: 0, paddingInlineStart: 16, fontSize: '0.75rem' }}>
            {errors.map(({ reason, equippedItem }) =>
              renderErrors(reason, t, equippedItem),
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default React.memo(ItemStatsList);
