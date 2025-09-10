/** @jsxImportSource @emotion/react */

import type { SetStateAction, Dispatch, MouseEvent } from 'react';

import { useCallback, memo } from 'react';

import {
  slotToUrlString,
  useEquipItemMutation,
  useToggleFavoriteMutation,
} from 'common/utils';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { useRouter } from 'next/router';
import { useApolloClient, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { ItemSlot, ItemSet, Item } from 'common/type-aliases';
import { notification } from 'antd';
import { useTranslation } from 'next-i18next';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { prependDe } from 'common/i18n-utils';

import BasicItemCard from './BasicItemCard';

interface Props {
  item: Item;
  itemSlotId: string | null;
  customSetId: string | null;
  selectItemSlot?: Dispatch<SetStateAction<ItemSlot | null>>;
  equipped: boolean;
  openSetModal: (set: ItemSet) => void;
  shouldRedirect?: boolean;
  remainingSlotIds: Array<string>;
  notifyOnEquip: boolean;
  isSuggestion?: boolean;
}

const ItemCard = ({
  item,
  itemSlotId,
  customSetId,
  selectItemSlot,
  equipped,
  openSetModal,
  shouldRedirect,
  remainingSlotIds,
  notifyOnEquip,
  isSuggestion,
}: Props) => {
  const mutate = useEquipItemMutation(item);
  const { t, i18n } = useTranslation('common');
  const client = useApolloClient();

  const router = useRouter();
  const { data } = useQuery<CurrentUserQueryType>(currentUserQuery);

  const {
    isFavorite,
    mutationResult: [toggleFavorite],
  } = useToggleFavoriteMutation(item);

  const onFavoriteToggle = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      toggleFavorite();
    },
    [toggleFavorite],
  );

  const onClick = useCallback(() => {
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

      if (notifyOnEquip || (shouldRedirect && customSetId && nextSlot)) {
        notify(nextSlot);
      }

      if (shouldRedirect && customSetId) {
        if (nextSlot) {
          router.replace(`/equip/${slotToUrlString(nextSlot)}/${customSetId}`);
        } else {
          router.push({
            pathname: customSetId ? `/build/${customSetId}` : '/',
          });
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
            <FontAwesomeIcon
              icon={isFavorite ? faHeartSolid : faHeartRegular}
            />
          </a>
        )
      }
      isSuggestion={isSuggestion}
    />
  );
};

export default memo(ItemCard);
