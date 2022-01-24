import { CustomSet, Item, ItemSet, ItemSlot } from 'common/type-aliases';
import { findEmptyOrOnlySlotId, findNextEmptySlotIds } from 'common/utils';
import ConfirmReplaceItemPopover from 'components/desktop/ConfirmReplaceItemPopover';
import ItemCard from './ItemCard';

export interface SharedProps {
  customSet?: CustomSet | null;
  selectedItemSlot: ItemSlot | null;
  customSetItemIds: Set<string>;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  isMobile: boolean;
  isClassic: boolean;
}

const ItemCardWithContext: React.FC<
  SharedProps & {
    item: Item;
    openSetModal: (set: ItemSet) => void;
    isSuggestion?: boolean;
  }
> = ({
  item,
  customSet,
  selectedItemSlot,
  customSetItemIds,
  selectItemSlot,
  isMobile,
  isClassic,
  openSetModal,
  isSuggestion,
}) => {
  const itemSlotId =
    selectedItemSlot?.id || findEmptyOrOnlySlotId(item.itemType, customSet);
  const remainingSlotIds = selectedItemSlot
    ? findNextEmptySlotIds(item.itemType, selectedItemSlot.id, customSet)
    : [];
  const card = (
    <ItemCard
      key={`item-card-${item.id}`}
      item={item}
      itemSlotId={itemSlotId}
      equipped={customSetItemIds.has(item.id)}
      customSetId={customSet?.id ?? null}
      selectItemSlot={selectItemSlot}
      openSetModal={openSetModal}
      shouldRedirect={isMobile || isClassic}
      remainingSlotIds={remainingSlotIds}
      notifyOnEquip={false}
      isSuggestion={isSuggestion}
    />
  );
  return itemSlotId || !customSet ? (
    card
  ) : (
    <ConfirmReplaceItemPopover
      key={`confirm-replace-item-popover-${item.id}`}
      item={item}
      customSet={customSet}
    >
      {card}
    </ConfirmReplaceItemPopover>
  );
};

export default ItemCardWithContext;
