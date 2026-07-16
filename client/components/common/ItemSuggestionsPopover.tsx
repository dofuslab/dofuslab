/** @jsxImportSource @emotion/react */

import { useCallback, useState } from 'react';

import { BulbOutlined } from '@ant-design/icons';
import { Popover, theme } from 'antd';
import { useTranslation } from 'next-i18next';

import { Item, ItemSlot } from 'common/type-aliases';
import { getImageUrl, useEquipItemMutation } from 'common/utils';

interface Props {
  slot: ItemSlot;
  suggestions?: Array<Item>;
}

const ItemSuggestionsPopover = ({ slot, suggestions }: Props) => {
  const { t } = useTranslation('common');
  const { token } = theme.useToken();
  const equipItem = useEquipItemMutation();
  const [open, setOpen] = useState(false);

  const stopSlotAction = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  if (!suggestions?.length) return null;

  const label = `${t('ITEM_SUGGESTIONS')}: ${slot.name}`;
  const content = (
    <div css={{ display: 'grid', gap: 4, width: 220 }}>
      {suggestions.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={stopSlotAction}
          onClick={(event) => {
            stopSlotAction(event);
            setOpen(false);
            equipItem(slot.id, item);
          }}
          css={{
            alignItems: 'center',
            background: 'transparent',
            border: 0,
            borderRadius: token.borderRadius,
            color: token.colorText,
            cursor: 'pointer',
            display: 'grid',
            font: 'inherit',
            gap: 8,
            gridTemplateColumns: '36px minmax(0, 1fr) auto',
            padding: '4px 6px',
            textAlign: 'left',
            width: '100%',
            '&:hover, &:focus-visible': {
              background: token.colorBgTextHover,
              outline: 'none',
            },
          }}
        >
          <img
            src={getImageUrl(item.imageUrl)}
            alt=""
            css={{ height: 36, objectFit: 'contain', width: 36 }}
          />
          <span css={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </span>
          <span css={{ color: token.colorTextSecondary, fontSize: 12 }}>
            {item.level}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      title={t('ITEM_SUGGESTIONS')}
      trigger={['hover', 'focus', 'click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottom"
    >
      <button
        type="button"
        aria-label={label}
        title={label}
        onMouseDown={stopSlotAction}
        onClick={stopSlotAction}
        css={{
          alignItems: 'center',
          background: token.colorPrimary,
          border: `1px solid ${token.colorBgContainer}`,
          borderRadius: '50%',
          color: token.colorTextLightSolid,
          cursor: 'pointer',
          display: 'flex',
          height: 24,
          justifyContent: 'center',
          padding: 0,
          position: 'absolute',
          right: -4,
          top: -4,
          width: 24,
          zIndex: 3,
          '&:focus-visible': { outline: `2px solid ${token.colorPrimaryBorder}` },
        }}
      >
        <BulbOutlined aria-hidden />
      </button>
    </Popover>
  );
};

export default ItemSuggestionsPopover;
