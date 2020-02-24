export enum EquipmentSlotId {
  Hat = 1,
  Cloak = 2,
  Amulet = 3,
  Ring = 4,
  Belt = 5,
  Boots = 6,
  Weapon = 7,
  Shield = 8,
  Dofus = 9,
  Pet = 10
}

export enum EquipmentTypeId {
  Hat = 1,
  Cloak = 2,
  Amulet = 3,
  Ring = 4,
  Belt = 5,
  Boots = 6,
  Axe = 7,
  Bow = 8,
  Dagger = 9,
  Hammer = 10,
  Pickaxe = 11,
  Scythe = 12,
  Shovel = 13,
  Staff = 14,
  Sword = 15,
  Tool = 16,
  Wand = 17,
  Shield = 18,
  Dofus = 19,
  Trophy = 20,
  Pet = 21,
  Petsmount = 22,
  Mount = 23
}

export enum EquipmentSlotName {
  Hat = "Hat",
  Cloak = "Cloak",
  Amulet = "Amulet",
  Ring = "Ring",
  Belt = "Belt",
  Boots = "Boots",
  Weapon = "Weapon",
  Shield = "Shield",
  Dofus = "Dofus",
  Pet = "Pet"
}

export interface EquipmentSlot {
  id: EquipmentSlotId;
  name: EquipmentSlotName;
  quantity: number;
}

export enum BasicStat {
  Vitality = "vitality",
  AP = "ap",
  MP = "mp",
  Initiative = "initiative",
  Prospecting = "prospecting",
  Range = "range",
  Summons = "summons"
}

export enum PrimaryStat {
  Wisdom = "wisdom",
  Strength = "strength",
  Intelligence = "intelligence",
  Chance = "chance",
  Agility = "agility"
}

export enum SecondaryStat {
  APResistance = "apResistance",
  APReduction = "apReduction",
  MPResistance = "mpResistance",
  MPReduction = "mpReduction",
  CriticalHits = "criticalHits",
  Heals = "heals",
  Lock = "lock",
  Dodge = "dodge"
}

export enum DamageStat {
  PctFinalDamage = "pctFinalDamage",
  Power = "power",
  CriticalDamage = "criticalDamage",
  NeutralDamage = "neutralDamage",
  EarthDamage = "earthDamage",
  FireDamage = "fireDamage",
  WaterDamage = "waterDamage",
  AirDamage = "airDamage",
  Reflect = "reflect",
  TrapDamage = "trapDamage",
  TrapPower = "trapPower",
  PushbackDamage = "pushbackDamage",
  PctSpellDamage = "pctSpellDamage",
  PctWeaponDamage = "pctWeaponDamage",
  PctRangedDamage = "pctRangedDamage",
  PctMeleeDamage = "pctMeleeDamage"
}

export enum ResistanceStat {
  NeutralResistance = "neutralResistance",
  PctNeutralResistance = "pctNeutralResistance",
  EarthResistance = "EarthResistance",
  PctEarthResistance = "pctEarthResistance",
  FireResistance = "FireResistance",
  PctFireResistance = "pctFireResistance",
  WaterResistance = "waterResistance",
  PctWaterResistance = "pctWaterResistance",
  AirResistance = "airResistance",
  PctAirResistance = "pctAirResistance",
  CriticalResistance = "criticalResistance",
  PushbackResistance = "pushbackResistance",
  PctRangedResistance = "pctRangedResistance",
  PctMeleeResistance = "pctMeleeResistance"
}

export type Stat =
  | BasicStat
  | PrimaryStat
  | SecondaryStat
  | DamageStat
  | ResistanceStat;

export type NormalStatLine = { stat: Stat; value: number };

export type CustomStatLine = { customStats: string[] };

export type StatLine = NormalStatLine | CustomStatLine;

export type StatCollection = StatLine[];

export interface Equipment {
  name: string;
  level: number;
  setId: number | null;
  typeId: EquipmentTypeId;
  stats: StatCollection;
  conditions?: Condition[];
  imgUrl?: string;
}

export interface Condition {
  stat: Stat;
  greaterThan: Boolean;
  threshold: number;
}
