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
export enum BuildGender {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

/**
 * An enumeration.
 */
export enum SpellEffectType {
  AIR_DAMAGE = "AIR_DAMAGE",
  AIR_HEALING = "AIR_HEALING",
  AIR_STEAL = "AIR_STEAL",
  AP = "AP",
  BEST_ELEMENT_DAMAGE = "BEST_ELEMENT_DAMAGE",
  BEST_ELEMENT_HEALING = "BEST_ELEMENT_HEALING",
  BEST_ELEMENT_STEAL = "BEST_ELEMENT_STEAL",
  EARTH_DAMAGE = "EARTH_DAMAGE",
  EARTH_HEALING = "EARTH_HEALING",
  EARTH_STEAL = "EARTH_STEAL",
  FIRE_DAMAGE = "FIRE_DAMAGE",
  FIRE_HEALING = "FIRE_HEALING",
  FIRE_STEAL = "FIRE_STEAL",
  HP_RESTORED = "HP_RESTORED",
  MP = "MP",
  NEUTRAL_DAMAGE = "NEUTRAL_DAMAGE",
  NEUTRAL_HEALING = "NEUTRAL_HEALING",
  NEUTRAL_STEAL = "NEUTRAL_STEAL",
  PUSHBACK_DAMAGE = "PUSHBACK_DAMAGE",
  SHIELD = "SHIELD",
  WATER_DAMAGE = "WATER_DAMAGE",
  WATER_HEALING = "WATER_HEALING",
  WATER_STEAL = "WATER_STEAL",
}

/**
 * An enumeration.
 */
export enum Stat {
  AGILITY = "AGILITY",
  AIR_DAMAGE = "AIR_DAMAGE",
  AIR_RES = "AIR_RES",
  AP = "AP",
  AP_PARRY = "AP_PARRY",
  AP_REDUCTION = "AP_REDUCTION",
  CHANCE = "CHANCE",
  CRITICAL = "CRITICAL",
  CRITICAL_DAMAGE = "CRITICAL_DAMAGE",
  CRITICAL_RES = "CRITICAL_RES",
  DAMAGE = "DAMAGE",
  DODGE = "DODGE",
  EARTH_DAMAGE = "EARTH_DAMAGE",
  EARTH_RES = "EARTH_RES",
  FIRE_DAMAGE = "FIRE_DAMAGE",
  FIRE_RES = "FIRE_RES",
  HEALS = "HEALS",
  INITIATIVE = "INITIATIVE",
  INTELLIGENCE = "INTELLIGENCE",
  LOCK = "LOCK",
  MP = "MP",
  MP_PARRY = "MP_PARRY",
  MP_REDUCTION = "MP_REDUCTION",
  NEUTRAL_DAMAGE = "NEUTRAL_DAMAGE",
  NEUTRAL_RES = "NEUTRAL_RES",
  PCT_AIR_RES = "PCT_AIR_RES",
  PCT_EARTH_RES = "PCT_EARTH_RES",
  PCT_FINAL_DAMAGE = "PCT_FINAL_DAMAGE",
  PCT_FIRE_RES = "PCT_FIRE_RES",
  PCT_MELEE_DAMAGE = "PCT_MELEE_DAMAGE",
  PCT_MELEE_RES = "PCT_MELEE_RES",
  PCT_NEUTRAL_RES = "PCT_NEUTRAL_RES",
  PCT_RANGED_DAMAGE = "PCT_RANGED_DAMAGE",
  PCT_RANGED_RES = "PCT_RANGED_RES",
  PCT_SPELL_DAMAGE = "PCT_SPELL_DAMAGE",
  PCT_WATER_RES = "PCT_WATER_RES",
  PCT_WEAPON_DAMAGE = "PCT_WEAPON_DAMAGE",
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
  WISDOM = "WISDOM",
}

/**
 * An enumeration.
 */
export enum WeaponEffectType {
  AIR_DAMAGE = "AIR_DAMAGE",
  AIR_HEALING = "AIR_HEALING",
  AIR_STEAL = "AIR_STEAL",
  AP = "AP",
  EARTH_DAMAGE = "EARTH_DAMAGE",
  EARTH_HEALING = "EARTH_HEALING",
  EARTH_STEAL = "EARTH_STEAL",
  FIRE_DAMAGE = "FIRE_DAMAGE",
  FIRE_HEALING = "FIRE_HEALING",
  FIRE_STEAL = "FIRE_STEAL",
  HP_RESTORED = "HP_RESTORED",
  MP = "MP",
  NEUTRAL_DAMAGE = "NEUTRAL_DAMAGE",
  NEUTRAL_HEALING = "NEUTRAL_HEALING",
  NEUTRAL_STEAL = "NEUTRAL_STEAL",
  WATER_DAMAGE = "WATER_DAMAGE",
  WATER_HEALING = "WATER_HEALING",
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
  private?: boolean | null;
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
  stats: StatFilter[];
  maxLevel: number;
  search: string;
  itemTypeIds: any[];
}

export interface SetFilters {
  stats: StatFilter[];
  maxLevel: number;
  search: string;
}

export interface StatFilter {
  stat: Stat;
  minValue?: number | null;
  maxValue?: number | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
