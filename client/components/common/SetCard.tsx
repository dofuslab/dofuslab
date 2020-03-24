/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { useTranslation } from 'i18n';
import { TruncatableText, SetBonuses } from 'common/wrappers';
import { sets_sets_edges_node } from 'graphql/queries/__generated__/sets';
import { itemCardStyle, BORDER_COLOR } from 'common/mixins';
import { useEquipSetMutation, useCustomSet } from 'common/utils';
import { MobileScreen, mobileScreenTypes } from 'common/types';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { mq } from 'common/constants';

interface IProps {
  set: sets_sets_edges_node;
  customSetId: string | null;
  setMobileScreen?: React.Dispatch<React.SetStateAction<MobileScreen>>;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
}

const SetCard: React.FC<IProps> = ({
  set,
  customSetId,
  setMobileScreen,
  selectItemSlot,
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
    setMobileScreen && setMobileScreen(mobileScreenTypes.HOME);
    selectItemSlot && selectItemSlot(null);
  }, [setMobileScreen, onClick]);

  return (
    <Card
      hoverable
      size="small"
      onClick={onEquipSet}
      title={
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <TruncatableText css={{ fontSize: '0.8rem' }}>
            {set.name}
          </TruncatableText>
          <div
            css={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 'auto' }}
          >
            {t('LEVEL_ABBREVIATION', { ns: 'common' })}{' '}
            {set.items?.reduce(
              (currentMax, item) => Math.max(item?.level || 0, currentMax),
              0,
            )}
          </div>
        </div>
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
