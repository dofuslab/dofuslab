import {
  customSet as CustomSet,
  customSet_equippedItems as EquippedItem,
  customSet_equippedItems_exos as Exo,
  customSet_stats as Stats,
  customSet_tagAssociations as CustomSetTagAssociations,
} from 'graphql/fragments/__generated__/customSet';
import {
  classById_classById_spellVariantPairs_spells as Spell,
  classById_classById_spellVariantPairs_spells_spellStats as SpellStats,
  classById_classById_spellVariantPairs_spells_spellStats_spellEffects as SpellEffect,
  classById_classById_spellVariantPairs as SpellVariantPair,
} from 'graphql/queries/__generated__/classById';
import {
  itemSlots_itemSlots as ItemSlot,
  itemSlots_itemSlots_itemTypes as ItemType,
} from 'graphql/queries/__generated__/itemSlots';
import { sets_sets_edges_node as SetWithItems } from 'graphql/queries/__generated__/sets';
import { set_setById_bonuses as SetBonus } from 'graphql/queries/__generated__/set';
import {
  item_weaponStats as WeaponStats,
  item_itemType as ItemTypeWithSlots,
} from 'graphql/fragments/__generated__/item';
import { classes_classes as Class } from 'graphql/queries/__generated__/classes';
import { classBuffs_classById_spellVariantPairs_spells as ClassBuffSpell } from 'graphql/queries/__generated__/classBuffs';

export type { set as ItemSet } from 'graphql/fragments/__generated__/set';
export type { item as Item } from 'graphql/fragments/__generated__/item';
export type { buff as Buff } from 'graphql/fragments/__generated__/buff';

export type {
  CustomSet,
  EquippedItem,
  ItemSlot,
  ItemType,
  Spell,
  SpellStats,
  SpellEffect,
  Exo,
  SetWithItems,
  SetBonus,
  WeaponStats,
  Stats,
  ItemTypeWithSlots,
  Class,
  SpellVariantPair,
  ClassBuffSpell,
  CustomSetTagAssociations,
};
