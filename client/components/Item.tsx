/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { items_items } from 'graphql/queries/__generated__/items';
import { BORDER_COLOR } from 'common/mixins';
import { useMutation } from '@apollo/react-hooks';
import {
  updateCustomSetItem,
  updateCustomSetItemVariables,
} from 'graphql/mutations/__generated__/updateCustomSetItem';
import UpdateCustomSetItemMutation from 'graphql/mutations/updateCustomSetItem.graphql';
import { useRouter } from 'next/router';
import { ItemStatsList } from 'common/wrappers';

interface IItem {
  item: items_items;
  selectedItemSlotId: string | null;
}

const Item: React.FC<IItem> = ({ item, selectedItemSlotId }) => {
  const router = useRouter();
  const { id: setId } = router.query;

  const [updateCustomSetItem] = useMutation<
    updateCustomSetItem,
    updateCustomSetItemVariables
  >(UpdateCustomSetItemMutation, {
    variables: {
      customSetId: setId,
      itemId: item.id,
      itemSlotId: selectedItemSlotId,
    },
  });

  const onClick = React.useCallback(async () => {
    const { data } = await updateCustomSetItem();
    if (data?.updateCustomSetItem?.customSet.id !== setId) {
      router.replace(
        `/?id=${data?.updateCustomSetItem?.customSet.id}`,
        `/set/${data?.updateCustomSetItem?.customSet.id}`,
        {
          shallow: true,
        },
      );
    }
  }, [updateCustomSetItem, setId]);
  return (
    <Card
      hoverable
      size="small"
      title={item.name}
      css={{
        width: '100%',
        fontSize: '0.75rem',
        borderRadius: 4,
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
