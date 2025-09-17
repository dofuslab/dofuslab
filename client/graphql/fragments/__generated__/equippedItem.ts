/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type equippedItem = {
  __typename: 'EquippedItem';
  id: any;
  weaponElementMage: Types.WeaponElementMage | null;
  slot: {
    __typename: 'ItemSlot';
    id: any;
    enName: string;
    name: string;
    order: number;
  };
  item: {
    __typename: 'Item';
    id: any;
    name: string;
    level: number;
    imageUrl: string;
    conditions: any | null;
    stats: Array<{
      __typename: 'ItemStat';
      id: any;
      order: number;
      maxValue: number | null;
      stat: Types.Stat | null;
      customStat: string | null;
    }>;
    weaponStats: {
      __typename: 'WeaponStat';
      id: any;
      apCost: number;
      usesPerTurn: number;
      minRange: number | null;
      maxRange: number;
      baseCritChance: number | null;
      critBonusDamage: number | null;
      weaponEffects: Array<{
        __typename: 'WeaponEffect';
        id: any;
        minDamage: number | null;
        maxDamage: number;
        effectType: Types.WeaponEffectType;
      }>;
    } | null;
    itemType: {
      __typename: 'ItemType';
      id: any;
      name: string;
      enName: string;
      eligibleItemSlots: Array<{
        __typename: 'ItemSlot';
        id: any;
        enName: string;
        order: number;
      }>;
    };
    set: {
      __typename: 'Set';
      id: any;
      name: string;
      bonuses: Array<{
        __typename: 'SetBonus';
        id: any;
        numItems: number;
        stat: Types.Stat | null;
        value: number | null;
        customStat: string | null;
      }>;
    } | null;
    buffs: Array<{
      __typename: 'Buff';
      id: any;
      stat: Types.Stat;
      incrementBy: number | null;
      critIncrementBy: number | null;
      maxStacks: number | null;
    }> | null;
  };
  exos: Array<{
    __typename: 'EquippedItemExo';
    id: any;
    stat: Types.Stat;
    value: number;
  }>;
};
