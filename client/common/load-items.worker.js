import { db } from './db';

self.onmessage = async () => {
  const res = await fetch(
    'https://dofus-lab.s3.us-east-2.amazonaws.com/db_dump/dofuslab_items_dump.json',
  );

  const result = await res.json();

  await db.transaction('rw', db.item, db.itemStat, async () => {
    db.item.clear();
    db.itemStat.clear();

    const itemStats = [];

    db.item.bulkPut(
      result.data.items.edges.map(({ node }) => {
        itemStats.push(...node.stats.map((s) => ({ ...s, itemId: node.id })));
        const { stats, ...rest } = node;
        return {
          ...rest,
          allNames: JSON.parse(node.allNames),
        };
      }),
    );

    db.itemStat.bulkPut(itemStats);
  });
};
