/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  items_items,
  items_items_stats,
} from 'graphql/queries/__generated__/items';
import { BORDER_COLOR } from 'common/mixins';
import { useMutation } from '@apollo/react-hooks';
import {
  updateCustomSetItem,
  updateCustomSetItemVariables,
} from 'graphql/mutations/__generated__/updateCustomSetItem';
import UpdateCustomSetItemMutation from 'graphql/mutations/updateCustomSetItem.graphql';
import { useRouter } from 'next/router';

interface IItem {
  item: items_items;
}

function displayStats(t: TFunction, statLine: items_items_stats) {
  const statName = t(statLine.stat as string);
  return `${statLine.maxValue} ${statName}`;
}

const Item: React.FC<IItem> = ({ item }) => {
  const { t } = useTranslation('stat');
  const router = useRouter();
  const { setId } = router.query;
  const [updateCustomSetItem] = useMutation<
    updateCustomSetItem,
    updateCustomSetItemVariables
  >(UpdateCustomSetItemMutation, {
    variables: { customSetId: setId, itemId: item.id },
  });

  const onClick = React.useCallback(async () => {
    const data = await updateCustomSetItem();
    console.log(data);
  }, [updateCustomSetItem]);
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
      <ul css={{ paddingLeft: 16, marginBottom: 0 }}>
        {item.stats.map((statLine, idx) => {
          return <li key={`stat-${idx}`}>{displayStats(t, statLine)}</li>;
        })}
      </ul>
    </Card>
  );
};

export default Item;
