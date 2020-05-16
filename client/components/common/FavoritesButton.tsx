/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Button, Modal } from 'antd';
import { useTranslation } from 'i18n';
import { mq, BREAKPOINTS } from 'common/constants';
import { HeartFilled } from '@ant-design/icons';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { useQuery } from '@apollo/react-hooks';
import { CustomSet, ItemSlot } from 'common/type-aliases';
import {
  findEmptyOrOnlySlotId,
  findNextEmptySlotIds,
  useSetModal,
} from 'common/utils';
import ConfirmReplaceItemPopover from 'components/desktop/ConfirmReplaceItemPopover';
import { useTheme } from 'emotion-theming';
import { Theme } from 'common/types';
import ItemCard from './ItemCard';
import SetModal from './SetModal';

interface Props {
  className?: string;
  customSet: CustomSet | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  shouldRedirect: boolean;
  showSets: boolean;
  selectedItemSlot: ItemSlot | null;
}

const FavoritesButton: React.FC<Props> = ({
  className,
  customSet,
  selectItemSlot,
  shouldRedirect,
  showSets,
  selectedItemSlot,
}) => {
  const { t } = useTranslation('common');
  const [modalOpen, setModalOpen] = React.useState(false);
  const openModal = React.useCallback(() => {
    setModalOpen(true);
  }, []);
  const closeModal = React.useCallback(() => {
    setModalOpen(false);
  }, []);
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);
  const {
    setModalVisible,
    selectedSet,
    openSetModal,
    closeSetModal,
  } = useSetModal();

  const theme = useTheme<Theme>();

  if (!data?.currentUser || showSets) {
    return null;
  }

  const favoriteItems = data.currentUser.favoriteItems
    .filter(
      (fi) =>
        !selectedItemSlot ||
        selectedItemSlot.itemTypes.map((it) => it.id).includes(fi.itemType.id),
    )
    .sort((i1, i2) => i1.name.localeCompare(i2.name));

  return (
    <>
      <Button
        css={{
          fontSize: '0.75rem',
          margin: '12px 0',
          height: 42,
          [mq[1]]: {
            height: 'auto',
          },
          [mq[4]]: { marginTop: '20px 0' },
        }}
        onClick={openModal}
        className={className}
      >
        <HeartFilled />
        {t('MY_FAVORITES')}
      </Button>
      <Modal
        visible={modalOpen}
        title={t('MY_FAVORITES')}
        onCancel={closeModal}
        bodyStyle={{ maxHeight: '65vh', overflow: 'auto' }}
        css={{
          [mq[0]]: { minWidth: '100%' },
          [mq[1]]: { minWidth: BREAKPOINTS[1] },
          [mq[2]]: { minWidth: BREAKPOINTS[2] },
        }}
        footer={null}
      >
        {favoriteItems.length > 0 ? (
          <div
            css={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))',
              gridGap: 12,
              [mq[4]]: { gridGap: 20 },
            }}
          >
            {favoriteItems.map((item) => {
              const itemSlotId =
                selectedItemSlot?.id ||
                findEmptyOrOnlySlotId(item.itemType, customSet);
              const remainingSlotIds = selectedItemSlot
                ? findNextEmptySlotIds(
                    item.itemType,
                    selectedItemSlot.id,
                    customSet,
                  )
                : [];
              const card = (
                <ItemCard
                  key={`item-card-${item.id}`}
                  item={item}
                  itemSlotId={itemSlotId}
                  equipped={false}
                  customSetId={customSet?.id ?? null}
                  selectItemSlot={selectItemSlot}
                  openSetModal={openSetModal}
                  shouldRedirect={shouldRedirect}
                  remainingSlotIds={remainingSlotIds}
                  notifyOnEquip
                />
              );
              return itemSlotId || !customSet ? (
                card
              ) : (
                <ConfirmReplaceItemPopover
                  item={item}
                  customSet={customSet}
                  key={`popover-${item.id}`}
                >
                  {card}
                </ConfirmReplaceItemPopover>
              );
            })}
          </div>
        ) : (
          <div
            css={{
              padding: 64,
              backgroundColor: theme.layer?.backgroundLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
            }}
          >
            {selectedItemSlot
              ? t('NO_FAVORITE_ITEMS_WITH_SLOT', {
                  itemTypes: selectedItemSlot.itemTypes
                    .map((it) => it.name)
                    .join('/'),
                })
              : t('NO_FAVORITE_ITEMS')}
          </div>
        )}
      </Modal>
      {selectedSet && (
        <SetModal
          setId={selectedSet.id}
          setName={selectedSet.name}
          visible={setModalVisible}
          onCancel={closeSetModal}
          customSet={customSet}
          shouldRedirect={shouldRedirect}
        />
      )}
    </>
  );
};

export default FavoritesButton;
