/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { ClassNames } from '@emotion/react';
import { Popover } from 'antd';

import { useTranslation } from 'next-i18next';
import { itemBox, popoverTitleStyle } from 'common/mixins';
import { useEquipItemMutation } from 'common/utils';
import { mq } from 'common/constants';
import { Item, CustomSet } from 'common/type-aliases';
import ItemWithStats from './ItemWithStats';

interface Props {
  item: Item;
  customSet: CustomSet;
}

const ConfirmReplaceItemPopover = ({ item, customSet, children }: Props) => {
  const { t } = useTranslation('common');
  const [selectedItemSlotId, setSelectedItemSlotId] = React.useState<
    string | null
  >(null);

  const [visible, setIsVisible] = React.useState(false);

  const mutate = useEquipItemMutation(item);

  const onSlotSelect = React.useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      await mutate(e.currentTarget.dataset.slotId);
      setIsVisible(false);
    },
    [setSelectedItemSlotId, item, mutate, setIsVisible],
  );

  return (
    <ClassNames>
      {({ css }) => (
        <Popover
          getPopupContainer={(node) => {
            if (node.parentElement) {
              return node.parentElement;
            }
            return document && document.body;
          }}
          content={
            <div
              css={{
                width: '100%',
                display: 'grid',
                gridGap: 8,
                gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                maxWidth: 240,
                [mq[4]]: { maxWidth: 300 },
              }}
            >
              {customSet.equippedItems
                .filter((equippedItem) =>
                  item.itemType.eligibleItemSlots
                    .map((slot) => slot.id)
                    .includes(equippedItem.slot.id),
                )
                .sort((item1, item2) =>
                  item1.slot.id.localeCompare(item2.slot.id),
                )
                .map((equippedItem) => (
                  <div
                    css={itemBox}
                    key={equippedItem.id}
                    data-slot-id={equippedItem.slot.id}
                    onClick={onSlotSelect}
                  >
                    <ItemWithStats
                      equippedItem={equippedItem}
                      selected={equippedItem.slot.id === selectedItemSlotId}
                      deletable={false}
                      customSet={customSet}
                    />
                  </div>
                ))}
            </div>
          }
          title={t('SELECT_ITEM_TO_REPLACE')}
          open={visible}
          onVisibleChange={setIsVisible}
          trigger="click"
          overlayClassName={css(popoverTitleStyle)}
        >
          <div css={{ display: 'flex', minWidth: 0 }}>{children}</div>
        </Popover>
      )}
    </ClassNames>
  );
};

export default ConfirmReplaceItemPopover;
