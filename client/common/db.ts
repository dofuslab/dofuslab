// db.ts
import Dexie, { Table } from 'dexie';
import { item_stats as ItemStat } from 'graphql/fragments/__generated__/item';
import { Item } from './type-aliases';
import { ALL_LANGUAGES_INCLUDING_UNSUPPORTED } from './i18n-utils';

const allLocaleNamesString = ALL_LANGUAGES_INCLUDING_UNSUPPORTED.map(
  (lang) => `allNames.${lang}`,
).join(', ');

export type DbItem = Omit<Item, 'set' | 'itemType' | 'stats'> & {
  set?: { id: string };
  itemType: { id: string };
};

export type DbItemStat = ItemStat;

export class DofusLabDexie extends Dexie {
  item!: Table<DbItem>;

  itemStat!: Table<DbItemStat>;

  constructor() {
    super('dofusLabData');
    this.version(1).stores({
      itemStat: `id, itemId, stat, maxValue`,
      item: `id, ${allLocaleNamesString},  level, itemSlotId, itemTypeId, setId`,
      set: `id, ${allLocaleNamesString}, level`,
      itemType: `id, ${allLocaleNamesString}`,
      itemSlot: `id, ${allLocaleNamesString}`,
      itemTypeInItemSlot: `itemTypeId, itemSlotId`,
    });
  }
}

export const db = new DofusLabDexie();
