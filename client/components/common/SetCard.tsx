/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Card } from 'antd';
import { useTranslation } from 'i18n';
import { SetBonuses, CardTitleWithLevel } from 'common/wrappers';
import { sets_sets_edges_node } from 'graphql/queries/__generated__/sets';
import { itemCardStyle, BORDER_COLOR } from 'common/mixins';
import { useEquipSetMutation, useCustomSet } from 'common/utils';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { mq } from 'common/constants';
import Router from 'next/router';

interface IProps {
  set: sets_sets_edges_node;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  isMobile?: boolean;
}

const SetCard: React.FC<IProps> = ({
  set,
  customSetId,
  selectItemSlot,
  isMobile,
}) => {
  const customSet = useCustomSet(customSetId);

  const { t } = useTranslation(['stat', 'common']);
  const [onClick] = useEquipSetMutation(set.id, customSet);
  const maxSetBonusItems = set.bonuses.reduce(
    (currMax, bonus) => Math.max(currMax, bonus.numItems),
    0,
  );

  const onEquipSet = React.useCallback(() => {
    onClick();
    selectItemSlot && selectItemSlot(null);
    if (isMobile && customSet) {
      Router.push(
        { pathname: '/index', query: { customSetId } },
        customSetId ? `/build/${customSetId}` : '/',
      );
    }
  }, [onClick, customSet]);

  return (
    <Card
      hoverable
      size="small"
      onClick={onEquipSet}
      title={
        <CardTitleWithLevel
          title={set.name}
          level={set.items?.reduce(
            (currentMax, item) => Math.max(item?.level || 0, currentMax),
            0,
          )}
        />
      }
      css={{
        ...itemCardStyle,
        [':hover']: {
          border: `1px solid ${BORDER_COLOR}`,
        },
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <div>
        <div
          css={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0px auto 12px',
          }}
        >
          {set.items.map(item => (
            <img
              src={item?.imageUrl}
              key={`item-${item.id}`}
              css={{
                width: 84,
                height: 84,
                [mq[1]]: {
                  width: 60,
                  height: 60,
                },
                [':not:first-of-type']: { marginLeft: 12 },
              }}
            />
          ))}
        </div>
        <SetBonuses
          bonuses={set.bonuses.filter(
            bonus => bonus.numItems === maxSetBonusItems,
          )}
          count={maxSetBonusItems}
          t={t}
        />
      </div>
    </Card>
  );
};

export default React.memo(SetCard);
