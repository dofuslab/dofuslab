/** @jsx jsx */

import React from 'react';
import { jsx, css } from '@emotion/core';
import Card from 'antd/lib/card';
import Tooltip from 'antd/lib/tooltip';
import { useMutation } from '@apollo/react-hooks';
import { DeleteOutlined, ToolOutlined } from '@ant-design/icons';

import { useTranslation } from 'i18n';
import { selected, itemCardStyle } from 'common/mixins';
import { ItemStatsList, Badge, TruncatableText } from 'common/wrappers';
import { item } from 'graphql/fragments/__generated__/item';
import DeleteCustomSetItemMutation from 'graphql/mutations/deleteCustomSetItem.graphql';
import {
  deleteCustomSetItem,
  deleteCustomSetItemVariables,
} from 'graphql/mutations/__generated__/deleteCustomSetItem';

interface IProps {
  item: item;
  selectedItemSlotId: string;
  customSetId: string;
}

const CurrentlyEquippedItem: React.FC<IProps> = ({
  item,
  selectedItemSlotId,
  customSetId,
}) => {
  const { t } = useTranslation('common');

  const [deleteItem] = useMutation<
    deleteCustomSetItem,
    deleteCustomSetItemVariables
  >(DeleteCustomSetItemMutation, {
    variables: { itemSlotId: selectedItemSlotId, customSetId },
  });

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.nativeEvent.stopPropagation();
      deleteItem();
    },
    [deleteItem],
  );

  return (
    <Card
      size="small"
      title={
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <TruncatableText>{item.name}</TruncatableText>{' '}
          <Badge>{t('EQUIPPED')}</Badge>
        </div>
      }
      css={css({
        ...itemCardStyle,
        ...selected,
      })}
      actions={[
        <Tooltip title={t('MAGE')}>
          <ToolOutlined />
        </Tooltip>,
        <Tooltip title={t('DELETE')}>
          <DeleteOutlined onClick={onClick} />
        </Tooltip>,
      ]}
    >
      <img
        src={item.imageUrl}
        css={{ float: 'right', width: 72, height: 72 }}
      />
      <ItemStatsList item={item} css={{ paddingLeft: 16, marginBottom: 0 }} />
    </Card>
  );
};

export default CurrentlyEquippedItem;
