/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { useTranslation } from 'i18n';
import { ItemStatsList, TruncatableText, Badge } from 'common/wrappers';
import { item } from 'graphql/fragments/__generated__/item';
import { BORDER_COLOR, itemCardStyle, itemBoxDimensions } from 'common/mixins';
import {
  findEmptyOrOnlySlotId,
  useEquipItemMutation,
  useCustomSet,
} from 'common/utils';
import ConfirmReplaceItemPopover from './ConfirmReplaceItemPopover';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';

interface IProps {
  item: item;
  selectedItemSlotId: string | null;
  customSetId: string | null;
  responsiveGridRef: React.MutableRefObject<HTMLDivElement | null>;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  equipped: boolean;
}

const ItemCard: React.FC<IProps> = ({
  item,
  selectedItemSlotId,
  customSetId,
  responsiveGridRef,
  selectItemSlot,
  equipped,
}) => {
  const customSet = useCustomSet(customSetId);

  const itemSlotId =
    selectedItemSlotId || findEmptyOrOnlySlotId(item.itemType, customSet);

  const mutate = useEquipItemMutation(item, customSet);

  const onClick = React.useCallback(async () => {
    if (itemSlotId) {
      selectItemSlot(null);
      await mutate(itemSlotId);
    }
  }, [item, itemSlotId, mutate, selectItemSlot]);

  const { t } = useTranslation(['stat', 'common']);

  const card = (
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

  return itemSlotId || !customSet ? (
    card
  ) : (
    <ConfirmReplaceItemPopover
      item={item}
      customSet={customSet}
      responsiveGridRef={responsiveGridRef}
    >
      {card}
    </ConfirmReplaceItemPopover>
  );
};

export default ItemCard;
