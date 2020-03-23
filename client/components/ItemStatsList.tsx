/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { item, item_set } from 'graphql/fragments/__generated__/item';
import { customSet_equippedItems_exos } from 'graphql/fragments/__generated__/customSet';
import { useTranslation } from 'i18n';
import { blue6 } from 'common/mixins';

interface IProps {
  readonly item: item;
  readonly className?: string;
  readonly exos?: ReadonlyArray<customSet_equippedItems_exos> | null;
  readonly hideSet?: boolean;
  readonly openSetModal?: (set: item_set) => void;
}

const ItemStatsList: React.FC<IProps> = ({
  item,
  className,
  exos,
  openSetModal,
}) => {
  const { t } = useTranslation('stat');

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

  return (
    <div>
      {item.set && (
        <div
          css={{ marginBottom: 12 }}
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
              : statLine.altStat}
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
    </div>
  );
};

export default ItemStatsList;
