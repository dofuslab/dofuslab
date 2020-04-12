/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Popover } from 'antd';
import { useTranslation } from 'i18n';

import { BORDER_COLOR, popoverTitleStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getBonusesFromCustomSet } from 'common/utils';
import { SetBonuses } from 'common/wrappers';
import { mq } from 'common/constants';

interface IProps {
  customSet: customSet;
}

const BonusStats: React.FC<IProps> = ({ customSet }) => {
  const { t } = useTranslation(['stat', 'common']);
  const setBonuses = getBonusesFromCustomSet(customSet);
  const itemOrder = customSet.equippedItems.reduce(
    (acc, curr) => ({ ...acc, [curr.item.id]: curr.slot.order }),
    {},
  ) as { [key: string]: number };

  return (
    <div
      css={{
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        [mq[1]]: { marginLeft: 20, marginTop: 0, flexDirection: 'row' },
      }}
    >
      <ClassNames>
        {({ css }) =>
          Object.values(setBonuses)
            .sort(({ set: { name: name1 } }, { set: { name: name2 } }) =>
              name1.localeCompare(name2),
            )
            .map(({ count, set: { id, name, bonuses }, equippedItems }) => {
              const filteredBonuses = bonuses.filter(
                bonus => bonus.numItems === count,
              );
              return (
                <Popover
                  key={id}
                  overlayClassName={css(popoverTitleStyle)}
                  title={
                    <div
                      css={{
                        display: 'flex',
                        alignItems: 'baseline',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>{name}</div>
                    </div>
                  }
                  content={
                    <SetBonuses count={count} bonuses={filteredBonuses} t={t} />
                  }
                  placement="bottomLeft"
                >
                  <div
                    css={{
                      display: 'flex',
                      background: 'white',
                      borderRadius: 4,
                      border: `1px solid ${BORDER_COLOR}`,
                      padding: '4px 8px',
                      ':not(:first-of-type)': {
                        marginTop: 12,
                        [mq[1]]: {
                          marginTop: 0,
                          marginLeft: 12,
                        },
                      },
                    }}
                  >
                    {[...equippedItems]
                      .sort((i, j) => itemOrder[i.id] - itemOrder[j.id])
                      .map(equippedItem => (
                        <div
                          key={`set-bonus-item-${equippedItem.id}`}
                          css={{
                            width: 40,
                            height: 40,
                            [mq[1]]: {
                              [':not:first-of-type']: { marginLeft: 4 },
                            },
                          }}
                        >
                          <img
                            src={equippedItem.item.imageUrl}
                            css={{ maxWidth: '100%', maxHeight: '100%' }}
                          />
                        </div>
                      ))}
                  </div>
                </Popover>
              );
            })
        }
      </ClassNames>
    </div>
  );
};

export default BonusStats;
