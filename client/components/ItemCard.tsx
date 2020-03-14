/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { useTranslation } from 'i18n';
import { ItemStatsList, TruncatableText, Badge } from 'common/wrappers';
import { item } from 'graphql/fragments/__generated__/item';
import { BORDER_COLOR, itemCardStyle, itemBoxDimensions } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { findEmptyOrOnlySlotId, useEquipItemMutation } from 'common/utils';
import ConfirmReplaceItemPopover from './ConfirmReplaceItemPopover';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';

interface IProps {
  item: item;
  selectedItemSlotId: string | null;
  selectedEquippedItem?: item | null;
  customSet?: customSet | null;
  responsiveGridRef: React.MutableRefObject<HTMLDivElement | null>;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
}

const ItemCard: React.FC<IProps> = ({
  item,
  selectedItemSlotId,
  selectedEquippedItem,
  customSet,
  responsiveGridRef,
  selectItemSlot,
}) => {
  const itemSlotId =
    selectedItemSlotId || findEmptyOrOnlySlotId(item.itemType, customSet);

  const mutate = useEquipItemMutation(item, customSet);

  const onClick = React.useCallback(async () => {
    if (itemSlotId) {
      await mutate(itemSlotId);
      selectItemSlot(null);
    }
  }, [item, itemSlotId, mutate, selectItemSlot]);

  const { t } = useTranslation('stat');

  const card = (
    <Card
      hoverable
      size="small"
      title={
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <TruncatableText>{item.name}</TruncatableText>
          {selectedEquippedItem?.id === item.id && (
            <Badge>{t('EQUIPPED')}</Badge>
          )}
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
