/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { useTranslation } from 'i18n';
import { ItemStatsList, TruncatableText, Badge } from 'common/wrappers';
import { item } from 'graphql/fragments/__generated__/item';
import { BORDER_COLOR, itemCardStyle, itemBoxDimensions } from 'common/mixins';
import { useEquipItemMutation, useCustomSet } from 'common/utils';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';

interface IProps {
  item: item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  equipped: boolean;
}

const ItemCard: React.FC<IProps> = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
}) => {
  const customSet = useCustomSet(customSetId);

  const mutate = useEquipItemMutation(item, customSet);

  const onClick = React.useCallback(async () => {
    if (itemSlotId) {
      selectItemSlot(null);
      await mutate(itemSlotId);
    }
  }, [item, itemSlotId, customSet, mutate, selectItemSlot]);

  const { t } = useTranslation(['stat', 'common']);

  return (
    <Card
      hoverable
      size="small"
      title={
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <TruncatableText>{item.name}</TruncatableText>
          {equipped && <Badge css={{ marginRight: 4 }}>{t('EQUIPPED')}</Badge>}
          <div
            css={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 'auto' }}
          >
            {t('LEVEL_ABBREVIATION', { ns: 'common' })} {item.level}
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
      onClick={onClick}
    >
      <img src={item.imageUrl} css={{ float: 'right', ...itemBoxDimensions }} />
      <ItemStatsList item={item} css={{ paddingLeft: 16, marginBottom: 0 }} />
    </Card>
  );
};

export default ItemCard;
