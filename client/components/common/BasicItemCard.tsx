/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';
import { TruncatableText, Badge } from 'common/wrappers';
import { item, item_set } from 'graphql/fragments/__generated__/item';
import { useTranslation } from 'i18n';
import { itemCardStyle, BORDER_COLOR, itemBoxDimensions } from 'common/mixins';
import ItemStatsList from './ItemStatsList';

interface IProps {
  item: item;
  equipped?: boolean;
  openSetModal?: (set: item_set) => void;
  onClick?: () => void;
}

const BasicItemCard: React.FC<IProps> = ({
  item,
  equipped,
  openSetModal,
  onClick,
}) => {
  const { t } = useTranslation('common');
  return (
    <Card
      hoverable={!!onClick}
      size="small"
      title={
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <TruncatableText css={{ marginRight: 8, fontSize: '0.8rem' }}>
            {item.name}
          </TruncatableText>
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
      <img
        src={item.imageUrl}
        css={{ ...itemBoxDimensions, float: 'right', maxWidth: 96 }}
      />
      <ItemStatsList
        item={item}
        css={{ paddingLeft: 16, marginBottom: 0 }}
        openSetModal={openSetModal}
      />
    </Card>
  );
};

export default BasicItemCard;
