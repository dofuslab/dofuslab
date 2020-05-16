/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useEquipItemMutation } from 'common/utils';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { useRouter } from 'next/router';
import { useApolloClient, useQuery, useMutation } from '@apollo/react-hooks';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { ItemSlot, ItemSet, Item } from 'common/type-aliases';
import { notification } from 'antd';
import { useTranslation, prependDe } from 'i18n';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import {
  toggleFavoriteItem,
  toggleFavoriteItemVariables,
} from 'graphql/mutations/__generated__/toggleFavoriteItem';
import toggleFavoriteItemMutation from 'graphql/mutations/toggleFavoriteItem.graphql';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import BasicItemCard from './BasicItemCard';

interface Props {
  item: Item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  equipped: boolean;
  openSetModal: (set: ItemSet) => void;
  shouldRedirect?: boolean;
  remainingSlotIds: Array<string>;
  notifyOnEquip: boolean;
}

const ItemCard: React.FC<Props> = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
  openSetModal,
  shouldRedirect,
  remainingSlotIds,
  notifyOnEquip,
}) => {
  const mutate = useEquipItemMutation(item);
  const { t, i18n } = useTranslation('common');
  const client = useApolloClient();

  const router = useRouter();
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);

  const isFavorite = (data?.currentUser?.favoriteItems ?? [])
    .map((fi) => fi.id)
    .includes(item.id);

  const [toggleFavorite] = useMutation<
    toggleFavoriteItem,
    toggleFavoriteItemVariables
  >(toggleFavoriteItemMutation, {
    variables: { itemId: item.id, isFavorite: !isFavorite },
    optimisticResponse:
      (data?.currentUser && {
        toggleFavoriteItem: {
          user: {
            ...data.currentUser,
            favoriteItems: isFavorite
              ? data.currentUser.favoriteItems.filter((fi) => fi.id !== item.id)
              : [...data.currentUser.favoriteItems, item],
          },
          __typename: 'ToggleFavoriteItem',
        },
      }) ||
      undefined,
  });

  const onFavoriteToggle = React.useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      toggleFavorite();
    },
    [toggleFavorite],
  );

  const onClick = React.useCallback(() => {
    const { query } = router;
    const nextSlotId = remainingSlotIds[0];
    const numRemainingSlots = remainingSlotIds.length;
    if (itemSlotId) {
      const slots = client.readQuery<itemSlots>({ query: ItemSlotsQuery });
      let nextSlot = null;
      if (nextSlotId && slots) {
        nextSlot =
          slots.itemSlots.find((slot) => slot.id === nextSlotId) || null;
      }
      if (selectItemSlot) {
        selectItemSlot(nextSlot);
      }

      const notify = (slot: ItemSlot | null) =>
        notification.success({
          message: t('SUCCESS'),
          description: slot
            ? t('ITEM_EQUIPPED_WITH_SLOT', {
                itemName: item.name,
                count: numRemainingSlots,
                slotName: prependDe(i18n.language, slot.name),
              })
            : t('ITEM_EQUIPPED', { itemName: item.name }),
        });

      if (notifyOnEquip) {
        notify(nextSlot);
      }

      if (shouldRedirect && customSetId) {
        if (nextSlot) {
          router.replace(
            {
              pathname: '/equip/[itemSlotId]/[customSetId]',
              query: {
                itemSlotId: nextSlot.id,
                customSetId,
              },
            },
            `/equip/${nextSlot.id}/${customSetId}`,
          );
          notify(nextSlot);
        } else {
          router.push(
            {
              pathname: '/',
              query: { customSetId, class: query.class || undefined },
            },
            {
              pathname: customSetId ? `/build/${customSetId}` : '/',
              query: query.class ? { class: query.class } : undefined,
            },
          );
        }
      }
      mutate(itemSlotId);
    }
  }, [
    item,
    itemSlotId,
    customSetId,
    mutate,
    selectItemSlot,
    shouldRedirect,
    client,
    remainingSlotIds,
    router,
    i18n,
    notifyOnEquip,
  ]);

  const FavoriteIcon = isFavorite ? HeartFilled : HeartOutlined;

  return (
    <BasicItemCard
      item={item}
      equipped={equipped}
      openSetModal={openSetModal}
      onClick={onClick}
      showOnlyWeaponStats={false}
      favorite={
        data?.currentUser && (
          <a onClick={onFavoriteToggle} css={{ padding: 4 }}>
            <FavoriteIcon />
          </a>
        )
      }
    />
  );
};

export default React.memo(ItemCard);
