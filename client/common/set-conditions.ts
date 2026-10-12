export const countEquippedSets = (
  equippedItems: ReadonlyArray<{ item: { set?: { id: string } | null } }>,
) => {
  const pieceCounts = new Map<string, number>();
  equippedItems.forEach(({ item }) => {
    if (item.set) {
      pieceCounts.set(item.set.id, (pieceCounts.get(item.set.id) ?? 0) + 1);
    }
  });
  return [...pieceCounts.values()].filter((count) => count >= 2).length;
};
