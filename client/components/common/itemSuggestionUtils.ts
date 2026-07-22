const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SuggestionSlot {
  id: string;
  itemTypes: Array<{ id: string }>;
}

export interface SuggestionEquippedItem {
  id: string;
  slot: { enName: string };
}

export interface SuggestionItem {
  id: string;
  itemType: { id: string };
}

export const buildItemSuggestionVariables = (
  level: number,
  equippedItems: Array<SuggestionEquippedItem>,
  slots: Array<SuggestionSlot>,
  numSuggestions = 50,
) => ({
  equippedItemIds: equippedItems
    .filter(({ id, slot }) => slot.enName !== 'Dofus' && UUID_PATTERN.test(id))
    .map(({ id }) => id),
  eligibleItemTypeIds: Array.from(
    new Set(slots.flatMap(({ itemTypes }) => itemTypes.map(({ id }) => id))),
  ),
  level,
  numSuggestions,
});

export const getItemSuggestionRequestKey = (
  buildId: string,
  variables: ReturnType<typeof buildItemSuggestionVariables>,
  slots: Array<SuggestionSlot>,
) =>
  [
    buildId,
    variables.level,
    [...variables.equippedItemIds].sort().join(','),
    [...variables.eligibleItemTypeIds].sort().join(','),
    slots
      .map(
        ({ id, itemTypes }) =>
          `${id}:${itemTypes
            .map(({ id: itemTypeId }) => itemTypeId)
            .sort()
            .join(',')}`,
      )
      .sort()
      .join(';'),
  ].join('|');

export const groupItemSuggestionsBySlot = <T extends SuggestionItem>(
  slots: Array<SuggestionSlot>,
  suggestions: Array<T>,
  maxPerSlot = 5,
) =>
  slots.reduce<Record<string, Array<T>>>((result, slot) => {
    const eligibleTypeIds = new Set(slot.itemTypes.map(({ id }) => id));
    const matches = suggestions
      .filter(({ itemType }) => eligibleTypeIds.has(itemType.id))
      .slice(0, maxPerSlot);

    if (matches.length > 0) {
      result[slot.id] = matches;
    }

    return result;
  }, {});

export interface ItemSuggestionResult<T> {
  requestKey: string;
  suggestionsBySlot: Record<string, Array<T>>;
}

export const getVisibleItemSuggestions = <T>(
  activeRequestKey: string | null,
  result: ItemSuggestionResult<T> | null,
) =>
  activeRequestKey && result?.requestKey === activeRequestKey
    ? result.suggestionsBySlot
    : {};
