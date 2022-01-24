/** @jsxImportSource @emotion/react */

import * as React from 'react';
import { itemSlots as ItemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { useQuery } from '@apollo/client';
import { CustomSet, ItemSlot } from 'common/type-aliases';
import { SEARCH_BAR_ID, SETS_SEARCH_BAR_ID } from 'common/constants';
import { findFirstEmptySlot, useDeleteItemMutation } from 'common/utils';

interface Props {
  selectedItemSlot: ItemSlot | null;
  selectItemSlot: (slotId: ItemSlot | null) => void;
  customSet?: CustomSet | null;
}

const keyToName: Record<string, string> = {
  h: 'Hat',
  c: 'Cloak',
  a: 'Amulet',
  b: 'Belt',
  o: 'Boots',
  w: 'Weapon',
  s: 'Shield',
  p: 'Pet',
};

const keyToMultiName: Record<string, 'Ring' | 'Dofus'> = {
  r: 'Ring',
  d: 'Dofus',
};

const SetBuilderKeyboardShortcuts: React.FC<Props> = ({
  selectedItemSlot,
  selectItemSlot,
  customSet,
}) => {
  const { data } = useQuery<ItemSlots>(ItemSlotsQuery);
  const deleteItem = useDeleteItemMutation(customSet);
  const itemSlots =
    data && [...data.itemSlots].sort((s1, s2) => s1.order - s2.order);

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const searchBar = (document.getElementById(SEARCH_BAR_ID) ||
        document.getElementById(SETS_SEARCH_BAR_ID)) as HTMLInputElement;

      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || !itemSlots) {
        return;
      }

      if (keyToName[e.key]) {
        const slot = itemSlots.find((slot) => slot.enName === keyToName[e.key]);
        if (slot) {
          selectItemSlot(slot);
        }
      }

      if (keyToMultiName[e.key]) {
        const name = keyToMultiName[e.key];
        let slot = findFirstEmptySlot(name, itemSlots, customSet);

        if (!slot) {
          const filteredSlots = itemSlots
            .sort((s1, s2) => s1.order - s2.order)
            .filter((s) => s.enName === name);
          if (selectedItemSlot) {
            slot = filteredSlots.find(
              (s) => s.order === selectedItemSlot.order + 1,
            );
          }

          if (!slot) {
            [slot] = filteredSlots;
          }
        }

        if (slot) {
          selectItemSlot(slot);
        }
      }

      if (e.key === 'Escape') {
        selectItemSlot(null);
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const nextKeyOrder = selectedItemSlot
          ? (selectedItemSlot.order +
              itemSlots.length +
              (e.key === 'ArrowRight' ? 1 : -1)) %
            itemSlots.length
          : 0;
        const slot = itemSlots.find((s) => s.order === nextKeyOrder);
        if (slot) {
          selectItemSlot(slot);
        }
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedItemSlot) {
          deleteItem(selectedItemSlot.id);
        }
      }

      if ((e.key === ' ' || e.key === 'Enter') && searchBar) {
        searchBar.focus();
        searchBar.setSelectionRange(0, searchBar.value.length);

        // prevents spacebar input from removing selection
        if (e.key === ' ') {
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [itemSlots, selectItemSlot, customSet, selectedItemSlot]);

  return null;
};

export default SetBuilderKeyboardShortcuts;
