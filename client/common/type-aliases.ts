import { customSet as CustomSet } from 'graphql/fragments/__generated__/customSet';
import { equippedItem as EquippedItem } from 'graphql/fragments/__generated__/equippedItem';
import { equippedItemExo as Exo } from 'graphql/fragments/__generated__/equippedItemExo';
import { customSetStats as Stats } from 'graphql/fragments/__generated__/customSetStats';
import { customSetTagAssociation as CustomSetTagAssociations } from 'graphql/fragments/__generated__/customSetTagAssociation';
import { spell as Spell } from 'graphql/fragments/__generated__/spell';
import { spellStats as SpellStats } from 'graphql/fragments/__generated__/spellStats';
import { spellVariantPair as SpellVariantPair } from 'graphql/fragments/__generated__/spellVariantPair';
import { spellEffect as SpellEffect } from 'graphql/fragments/__generated__/spellEffect';
import { itemSlot as ItemSlot } from 'graphql/fragments/__generated__/itemSlot';
import { itemType as ItemType } from 'graphql/fragments/__generated__/itemType';
import { sets } from 'graphql/queries/__generated__/sets';
import { setBonus as SetBonus } from 'graphql/fragments/__generated__/setBonus';
import { weaponStats as WeaponStats } from 'graphql/fragments/__generated__/weaponStats';
import { itemTypeWithSlots as ItemTypeWithSlots } from 'graphql/fragments/__generated__/itemTypeWithSlots';
import { itemSet as ItemSetType } from 'graphql/fragments/__generated__/itemSet';
import { equippedItemSlot as EquippedItemSlot } from 'graphql/fragments/__generated__/equippedItemSlot';
import { dofusClass as DofusClass } from 'graphql/fragments/__generated__/dofusClass';
import { abbreviatedCustomSet as AbbreviatedCustomSetType } from 'graphql/fragments/__generated__/abbreviatedCustomSet';

export type { set as Set } from 'graphql/fragments/__generated__/set';
export type { item as Item } from 'graphql/fragments/__generated__/item';
export type { buff as Buff } from 'graphql/fragments/__generated__/buff';

// Type aliases for complex nested types
type SetWithItems = sets['sets']['edges'][0]['node'];
type ItemSet = ItemSetType;
type ClassBuffSpell = Spell;
type AbbreviatedCustomSet = AbbreviatedCustomSetType;

export type {
  CustomSet,
  EquippedItem,
  EquippedItemSlot,
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
  ItemSet,
  DofusClass,
  SpellVariantPair,
  ClassBuffSpell,
  AbbreviatedCustomSet,
  CustomSetTagAssociations,
};
