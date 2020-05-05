/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Popover } from 'antd';

import { item } from 'graphql/fragments/__generated__/item';
import { useTranslation } from 'i18n';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemBox, popoverTitleStyle } from 'common/mixins';
import { useEquipItemMutation } from 'common/utils';
import { mq } from 'common/constants';
import ItemWithStats from './ItemWithStats';

interface Props {
  item: item;
  customSet: customSet;
}

const ConfirmReplaceItemPopover: React.FC<Props> = ({
  item,
  customSet,
  children,
}) => {
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
          getPopupContainer={(node) => node.parentElement!}
          content={(
            <div
              css={{
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                maxWidth: 240,
                [mq[4]]: { maxWidth: 300 },
              }}
            >
              {customSet.equippedItems
                .filter((equippedItem) => item.itemType.eligibleItemSlots
                  .map((slot) => slot.id)
                  .includes(equippedItem.slot.id))
                .sort((item1, item2) => item1.slot.id.localeCompare(item2.slot.id))
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
          )}
          title={t('SELECT_ITEM_TO_REPLACE')}
          visible={visible}
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
