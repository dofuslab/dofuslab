// Recheck slots at mutation time, including pending optimistic equips.
export const resolveEquipSlotId = (
  requestedSlotId: string,
  eligibleSlots: ReadonlyArray<{ id: string; order: number }>,
  equippedItems: ReadonlyArray<{ slot: { id: string } }>,
  useNextOpenSlot: boolean,
) => {
  if (!useNextOpenSlot) return requestedSlotId;
  const occupied = new Set(equippedItems.map(({ slot }) => slot.id));
  if (!occupied.has(requestedSlotId)) return requestedSlotId;
  // Single-slot items still intentionally replace their existing equipment.
  if (eligibleSlots.length === 1) return requestedSlotId;
  return (
    [...eligibleSlots]
      .sort((a, b) => a.order - b.order)
      .find(({ id }) => !occupied.has(id))?.id ?? null
  );
};
