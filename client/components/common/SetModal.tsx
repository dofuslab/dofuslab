/** @jsxImportSource @emotion/react */

import { useState, useContext, useCallback, useEffect } from 'react';

import { Modal, Divider, Skeleton, Alert } from 'antd';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTheme } from '@emotion/react';
import groupBy from 'lodash/groupBy';

import { set, setVariables } from 'graphql/queries/__generated__/set';
import setQuery from 'graphql/queries/set.query';
import { useTranslation } from 'next-i18next';
import { SetBonuses } from 'common/wrappers';
import { itemBox } from 'common/mixins';
import { mq } from 'common/constants';
import { useEquipItemsMutation, EditableContext } from 'common/utils';
import { CustomSet, SetBonus } from 'common/type-aliases';
import BasicItemWithStats from '../desktop/BasicItemWithStats';

interface Props {
  setId: string;
  setName: string;
  open: boolean;
  onCancel: () => void;
  customSet?: CustomSet | null;
  shouldRedirect?: boolean;
}

function checkIfItemsCanAllBeEquipped(
  data: set | undefined,
  itemIds: Array<string>,
) {
  if (!data) {
    return true;
  }

  const equippedItemSlotIds = new Set<string>();

  const selectedItems = data.setById.items.filter((item) =>
    itemIds.includes(item.id),
  );

  let result = true;

  selectedItems.forEach((item) => {
    const slotToEquip = item.itemType.eligibleItemSlots.find(
      (slot) => !equippedItemSlotIds.has(slot.id),
    );

    if (slotToEquip) {
      equippedItemSlotIds.add(slotToEquip.id);
    } else {
      result = false;
    }
  });

  return result;
}

const SetModal = ({
  setId,
  setName,
  open,
  onCancel,
  customSet,
  shouldRedirect,
}: Props) => {
  const { data, loading, error } = useQuery<set, setVariables>(setQuery, {
    variables: { id: setId },
  });

  const router = useRouter();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [itemIds, setItemIds] = useState<Array<string>>([]);

  const canAllItemsBeEquipped = checkIfItemsCanAllBeEquipped(data, itemIds);

  const [mutate, { loading: mutationLoading }] = useEquipItemsMutation(
    itemIds,
    customSet,
  );

  const isEditable = useContext(EditableContext);

  const onOk = useCallback(async () => {
    if (!isEditable) {
      return;
    }
    await mutate();
    onCancel();
    if (shouldRedirect && customSet) {
      router.push(customSet ? `/build/${customSet.id}/` : '/');
    }
  }, [mutate, onCancel, customSet, shouldRedirect, router, isEditable]);

  useEffect(() => {
    if (data && !loading && isEditable) {
      setItemIds(data.setById.items.map((item) => item.id));
    }
  }, [data, loading, isEditable]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!data || !open) return;
      if (e.key === 'Enter') {
        onOk();
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [data, open, onOk]);

  let bodyContent = null;

  if (loading) {
    bodyContent = <Skeleton paragraph={{ rows: 6 }} />;
  } else if (error || !data) {
    bodyContent = <div>{t('ERROR_OCCURRED')}</div>;
  } else {
    bodyContent = (
      <div>
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gridGap: 8,
          }}
        >
          {data.setById.items.map((item) => (
            <div
              key={`item-${item.id}`}
              css={{ display: 'flex', justifyContent: 'center' }}
              onClick={() => {
                if (!isEditable) return;
                setItemIds((prev) => {
                  if (prev.includes(item.id)) {
                    return prev.filter((itemId) => itemId !== item.id);
                  }
                  return [...prev, item.id];
                });
              }}
            >
              <div
                css={{
                  ...itemBox(theme),
                }}
              >
                <BasicItemWithStats
                  item={item}
                  overlayCSS={{ zIndex: 1032 }}
                  selected={itemIds.includes(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
        {!canAllItemsBeEquipped && (
          <Alert
            css={{ marginTop: 20 }}
            message={t('SELECTED_ITEMS_CANNOT_BE_EQUIPPED')}
            type="error"
          />
        )}
        <Divider />
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            [mq[0]]: {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },
            gridGap: 20,
          }}
        >
          {Object.entries(
            groupBy(data.setById.bonuses, (bonus: SetBonus) => bonus.numItems),
          )
            .sort(([a, b]) => Number(a) - Number(b))
            .map(([numItems, bonuses]) => (
              <SetBonuses
                key={`bonuses-${numItems}`}
                count={Number(numItems)}
                bonuses={bonuses}
                css={{
                  flex: '0 0 144px',
                  background: theme.layer?.backgroundLight,
                  borderRadius: 4,
                  padding: 12,
                }}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <Modal
      title={setName}
      open={open}
      onCancel={onCancel}
      zIndex={1031}
      confirmLoading={mutationLoading}
      onOk={onOk}
      okButtonProps={{
        disabled: !itemIds.length || !isEditable || !canAllItemsBeEquipped,
      }}
      okText={
        <span css={{ fontSize: '0.75rem' }}>
          {t('EQUIP_ITEMS', { count: itemIds.length })}
        </span>
      }
      cancelText={<span css={{ fontSize: '0.75rem' }}>{t('CANCEL')}</span>}
    >
      {bodyContent}
    </Modal>
  );
};

export default SetModal;
