/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * An enumeration.
 */
export enum SpellEffectType {
  AIR_DAMAGE = "AIR_DAMAGE",
  AIR_STEAL = "AIR_STEAL",
  AP = "AP",
  BEST_ELEMENT_DAMAGE = "BEST_ELEMENT_DAMAGE",
  BEST_ELEMENT_STEAL = "BEST_ELEMENT_STEAL",
  EARTH_DAMAGE = "EARTH_DAMAGE",
  EARTH_STEAL = "EARTH_STEAL",
  FIRE_DAMAGE = "FIRE_DAMAGE",
  FIRE_STEAL = "FIRE_STEAL",
  HP_RESTORED = "HP_RESTORED",
  KAMAS = "KAMAS",
  MP = "MP",
  NEUTRAL_DAMAGE = "NEUTRAL_DAMAGE",
  NEUTRAL_STEAL = "NEUTRAL_STEAL",
  PUSHBACK_DAMAGE = "PUSHBACK_DAMAGE",
  SHIELD = "SHIELD",
  WATER_DAMAGE = "WATER_DAMAGE",
  WATER_STEAL = "WATER_STEAL",
}

/**
 * An enumeration.
 */
export enum Stat {
  AGILITY = "AGILITY",
  AIR_DAMAGE = "AIR_DAMAGE",
  AIR_RES = "AIR_RES",
  AIR_RES_PVP = "AIR_RES_PVP",
  AP = "AP",
  AP_PARRY = "AP_PARRY",
  AP_REDUCTION = "AP_REDUCTION",
  CHANCE = "CHANCE",
  CRITICAL = "CRITICAL",
  CRITICAL_DAMAGE = "CRITICAL_DAMAGE",
  CRITICAL_FAILURE = "CRITICAL_FAILURE",
  CRITICAL_RES = "CRITICAL_RES",
  DAMAGE = "DAMAGE",
  DODGE = "DODGE",
  EARTH_DAMAGE = "EARTH_DAMAGE",
  EARTH_RES = "EARTH_RES",
  EARTH_RES_PVP = "EARTH_RES_PVP",
  FIRE_DAMAGE = "FIRE_DAMAGE",
  FIRE_RES = "FIRE_RES",
  FIRE_RES_PVP = "FIRE_RES_PVP",
  HEALS = "HEALS",
  HP = "HP",
  INITIATIVE = "INITIATIVE",
  INTELLIGENCE = "INTELLIGENCE",
  LOCK = "LOCK",
  MAGICAL_REDUCTION = "MAGICAL_REDUCTION",
  MP = "MP",
  MP_PARRY = "MP_PARRY",
  MP_REDUCTION = "MP_REDUCTION",
  NEUTRAL_DAMAGE = "NEUTRAL_DAMAGE",
  NEUTRAL_RES = "NEUTRAL_RES",
  NEUTRAL_RES_PVP = "NEUTRAL_RES_PVP",
  PCT_AIR_RES = "PCT_AIR_RES",
  PCT_AIR_RES_PVP = "PCT_AIR_RES_PVP",
  PCT_EARTH_RES = "PCT_EARTH_RES",
  PCT_EARTH_RES_PVP = "PCT_EARTH_RES_PVP",
  PCT_FINAL_DAMAGE = "PCT_FINAL_DAMAGE",
  PCT_FIRE_RES = "PCT_FIRE_RES",
  PCT_FIRE_RES_PVP = "PCT_FIRE_RES_PVP",
  PCT_MELEE_DAMAGE = "PCT_MELEE_DAMAGE",
  PCT_MELEE_RES = "PCT_MELEE_RES",
  PCT_NEUTRAL_RES = "PCT_NEUTRAL_RES",
  PCT_NEUTRAL_RES_PVP = "PCT_NEUTRAL_RES_PVP",
  PCT_RANGED_DAMAGE = "PCT_RANGED_DAMAGE",
  PCT_RANGED_RES = "PCT_RANGED_RES",
  PCT_SPELL_DAMAGE = "PCT_SPELL_DAMAGE",
  PCT_WATER_RES = "PCT_WATER_RES",
  PCT_WATER_RES_PVP = "PCT_WATER_RES_PVP",
  PCT_WEAPON_DAMAGE = "PCT_WEAPON_DAMAGE",
  PHYSICAL_REDUCTION = "PHYSICAL_REDUCTION",
  PODS = "PODS",
  POWER = "POWER",
  PROSPECTING = "PROSPECTING",
  PUSHBACK_DAMAGE = "PUSHBACK_DAMAGE",
  PUSHBACK_RES = "PUSHBACK_RES",
  RANGE = "RANGE",
  REFLECT = "REFLECT",
  STRENGTH = "STRENGTH",
  SUMMON = "SUMMON",
  TRAP_DAMAGE = "TRAP_DAMAGE",
  TRAP_POWER = "TRAP_POWER",
  VITALITY = "VITALITY",
  WATER_DAMAGE = "WATER_DAMAGE",
  WATER_RES = "WATER_RES",
  WATER_RES_PVP = "WATER_RES_PVP",
  WISDOM = "WISDOM",
}

/**
 * An enumeration.
 */
export enum WeaponEffectType {
  AIR_DAMAGE = "AIR_DAMAGE",
  AIR_STEAL = "AIR_STEAL",
  AP = "AP",
  EARTH_DAMAGE = "EARTH_DAMAGE",
  EARTH_STEAL = "EARTH_STEAL",
  FIRE_DAMAGE = "FIRE_DAMAGE",
  FIRE_STEAL = "FIRE_STEAL",
  HP_RESTORED = "HP_RESTORED",
  KAMAS = "KAMAS",
  MP = "MP",
  NEUTRAL_DAMAGE = "NEUTRAL_DAMAGE",
  NEUTRAL_STEAL = "NEUTRAL_STEAL",
  WATER_DAMAGE = "WATER_DAMAGE",
  WATER_STEAL = "WATER_STEAL",
}

/**
 * An enumeration.
 */
export enum WeaponElementMage {
  AIR_50 = "AIR_50",
  AIR_68 = "AIR_68",
  AIR_85 = "AIR_85",
  EARTH_50 = "EARTH_50",
  EARTH_68 = "EARTH_68",
  EARTH_85 = "EARTH_85",
  FIRE_50 = "FIRE_50",
  FIRE_68 = "FIRE_68",
  FIRE_85 = "FIRE_85",
  WATER_50 = "WATER_50",
  WATER_68 = "WATER_68",
  WATER_85 = "WATER_85",
}

export interface CustomSetExosInput {
  stat: Stat;
  value: number;
}

export interface CustomSetFilters {
  search: string;
  tagIds: any[];
  defaultClassId?: any | null;
}

export interface CustomSetStatsInput {
  scrolledVitality: number;
  scrolledWisdom: number;
  scrolledStrength: number;
  scrolledIntelligence: number;
  scrolledChance: number;
  scrolledAgility: number;
  baseVitality: number;
  baseWisdom: number;
  baseStrength: number;
  baseIntelligence: number;
  baseChance: number;
  baseAgility: number;
}

export interface ItemFilters {
  stats: Stat[];
  maxLevel: number;
  search: string;
  itemTypeIds: any[];
}

export interface SetFilters {
  stats: Stat[];
  maxLevel: number;
  search: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
