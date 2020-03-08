/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { useMutation } from '@apollo/react-hooks';
import { useTranslation } from 'i18n';
import {
  updateCustomSetItem,
  updateCustomSetItemVariables,
} from 'graphql/mutations/__generated__/updateCustomSetItem';
import UpdateCustomSetItemMutation from 'graphql/mutations/updateCustomSetItem.graphql';
import { useRouter } from 'next/router';
import { ItemStatsList, TruncatableText, Badge } from 'common/wrappers';
import { item } from 'graphql/fragments/__generated__/item';
import { BORDER_COLOR, itemCardStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { findEmptyOrOnlySlotId } from 'common/utils';

interface IItem {
  item: item;
  selectedItemSlotId: string | null;
  selectedEquippedItem?: item | null;
  customSet?: customSet | null;
}

const Item: React.FC<IItem> = ({
  item,
  selectedItemSlotId,
  selectedEquippedItem,
  customSet,
}) => {
  const router = useRouter();
  const { id: setId } = router.query;

  const [updateCustomSetItem] = useMutation<
    updateCustomSetItem,
    updateCustomSetItemVariables
  >(UpdateCustomSetItemMutation);

  const onClick = React.useCallback(async () => {
    const itemSlotId =
      selectedItemSlotId || findEmptyOrOnlySlotId(item.itemType, customSet);

    if (itemSlotId) {
      const { data } = await updateCustomSetItem({
        variables: {
          customSetId: setId,
          itemId: item.id,
          itemSlotId,
        },
      });

      if (data?.updateCustomSetItem?.customSet.id !== setId) {
        router.replace(
          `/?id=${data?.updateCustomSetItem?.customSet.id}`,
          `/set/${data?.updateCustomSetItem?.customSet.id}`,
          {
            shallow: true,
          },
        );
      }
    }
  }, [updateCustomSetItem, setId, customSet, item, selectedItemSlotId]);

  const { t } = useTranslation('stat');

  return (
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
      <img
        src={item.imageUrl}
        css={{ float: 'right', width: 72, height: 72 }}
      />
      <ItemStatsList item={item} css={{ paddingLeft: 16, marginBottom: 0 }} />
    </Card>
  );
};

export default Item;
