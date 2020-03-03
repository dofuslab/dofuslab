import {
  EquipmentSlot,
  EquipmentSlotId,
  EquipmentSlotName,
  EquipmentTypeId,
  BasicStat,
  PrimaryStat,
  SecondaryStat,
  DamageStat,
  ResistanceStat
} from "./types";

export const BREAKPOINTS = [600, 900, 1200, 1500];

export const mq = BREAKPOINTS.map(bp => `@media (min-width: ${bp}px)`);

const UNTYPED_EQUIPMENT_SLOTS: any = {};

const EQUIPMENT_SLOT_QUANTITIES: { [key: number]: number } = {
  [EquipmentSlotId.Ring]: 2,
  [EquipmentSlotId.Dofus]: 6
};

// function isEquipmentSlotId(
//   id: EquipmentSlotId | string
// ): id is EquipmentSlotId {
//   return typeof id === "number";
// }

// using ID enum and EQUIPMENT_SLOT_QUANTITIES, e.g. { Hat: 1, Weapon: 2 ...},
// create object EQUIPMENT_SLOTS like { Hat: { id: 1, name: Hat, quantity: 1 } ...}

Object.entries(EquipmentSlotId)
  // filter needed to remove reverse mappings generated from enums in TS,
  // e.g. { 1: "Hat" }
  .filter(([name, id]) => typeof name === "string" && typeof id === "number")
  .forEach(([name, id]) => {
    const typeSafeId = id as EquipmentSlotId;
    UNTYPED_EQUIPMENT_SLOTS[name] = {
      name,
      id: typeSafeId,
      quantity: EQUIPMENT_SLOT_QUANTITIES[typeSafeId] || 1
    };
  });

export const EQUIPMENT_SLOTS = <{ [key in EquipmentSlotName]: EquipmentSlot }>(
  UNTYPED_EQUIPMENT_SLOTS
);

export const EQUIPMENT_TYPE_TO_SLOT: {
  [key in EquipmentTypeId]: EquipmentSlotId;
} = {
  [EquipmentTypeId.Hat]: EquipmentSlotId.Hat,
  [EquipmentTypeId.Cloak]: EquipmentSlotId.Cloak,
  [EquipmentTypeId.Amulet]: EquipmentSlotId.Amulet,
  [EquipmentTypeId.Ring]: EquipmentSlotId.Ring,
  [EquipmentTypeId.Belt]: EquipmentSlotId.Belt,
  [EquipmentTypeId.Boots]: EquipmentSlotId.Boots,
  [EquipmentTypeId.Axe]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Bow]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Dagger]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Hammer]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Pickaxe]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Scythe]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Shovel]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Staff]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Sword]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Tool]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Wand]: EquipmentSlotId.Weapon,
  [EquipmentTypeId.Shield]: EquipmentSlotId.Shield,
  [EquipmentTypeId.Dofus]: EquipmentSlotId.Dofus,
  [EquipmentTypeId.Trophy]: EquipmentSlotId.Dofus,
  [EquipmentTypeId.Pet]: EquipmentSlotId.Pet,
  [EquipmentTypeId.Petsmount]: EquipmentSlotId.Pet,
  [EquipmentTypeId.Mount]: EquipmentSlotId.Pet
};

const UNTYPED_EQUIPMENT_SLOT_TO_TYPES: any = {};

Object.entries(EQUIPMENT_TYPE_TO_SLOT).forEach(([typeId, slotId]) => {
  const currentSlot = UNTYPED_EQUIPMENT_SLOT_TO_TYPES[slotId];
  if (!currentSlot) {
    UNTYPED_EQUIPMENT_SLOT_TO_TYPES[slotId] = [Number(typeId)];
  } else {
    currentSlot.push(Number(typeId));
  }
});

export const CUSTOM_STAT = "custom";

export const STAT_GROUPS: ReadonlyArray<{
  name: string;
  groups: ReadonlyArray<{ [key: string]: string }>;
}> = [
  { name: "Primary characteristics", groups: [BasicStat, PrimaryStat] },
  { name: "Secondary characteristics", groups: [SecondaryStat] },
  { name: "Damage", groups: [DamageStat] },
  { name: "Resistance", groups: [ResistanceStat] }
];

export const EQUIPMENT_SLOT_TO_TYPES = <
  { [key in EquipmentSlotId]: EquipmentTypeId[] }
>UNTYPED_EQUIPMENT_SLOT_TO_TYPES;
