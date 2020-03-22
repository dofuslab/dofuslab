import { StatGroup, StatsFromCustomSet } from './types';
import { Stat } from '__generated__/globalTypes';

export const DEBOUNCE_INTERVAL = 300;

export const BREAKPOINTS = [600, 900, 1200, 1450, 1650, 1900, 2100];

export const mq = BREAKPOINTS.map(bp => `@media (min-width: ${bp}px)`);

const getStatWithDefault = (
  statsFromCustomSet: StatsFromCustomSet,
  stat: Stat,
) => statsFromCustomSet[stat] || 0;

export const STAT_GROUPS: ReadonlyArray<StatGroup> = [
  [
    {
      stat: 'HP',
      customCalculateValue: (statsFromCustomSet, customSet) =>
        50 +
        (customSet?.level ?? 200) * 5 +
        (statsFromCustomSet ? statsFromCustomSet[Stat.VITALITY] || 0 : 0),
      icon: { backgroundPositionX: -97, backgroundPositionY: -919 },
    },
    {
      stat: Stat.AP,
      customCalculateValue: (statsFromCustomSet, customSet) =>
        ((customSet?.level ?? 200) >= 100 ? 7 : 6) +
        (statsFromCustomSet ? statsFromCustomSet[Stat.AP] || 0 : 0),
      icon: { backgroundPositionX: -97, backgroundPositionY: -243 },
    },
    {
      stat: Stat.MP,
      customCalculateValue: statsFromCustomSet =>
        3 + (statsFromCustomSet ? statsFromCustomSet[Stat.MP] || 0 : 0),
      icon: { backgroundPositionX: -97, backgroundPositionY: -52 },
    },
    {
      stat: Stat.RANGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -128 },
    },
  ],
  [
    {
      stat: Stat.INITIATIVE,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? getStatWithDefault(statsFromCustomSet, Stat.STRENGTH) +
            getStatWithDefault(statsFromCustomSet, Stat.INTELLIGENCE) +
            getStatWithDefault(statsFromCustomSet, Stat.CHANCE) +
            getStatWithDefault(statsFromCustomSet, Stat.AGILITY) +
            getStatWithDefault(statsFromCustomSet, Stat.INITIATIVE)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -205 },
    },
    {
      stat: Stat.CRITICAL,
      icon: { backgroundPositionX: -97, backgroundPositionY: -589 },
    },
    {
      stat: Stat.SUMMON,
      customCalculateValue: statsFromCustomSet =>
        1 + (statsFromCustomSet ? statsFromCustomSet[Stat.SUMMON] || 0 : 0),
      icon: { backgroundPositionX: -97, backgroundPositionY: -507 },
    },
    {
      stat: Stat.HEALS,
      icon: { backgroundPositionX: -97, backgroundPositionY: -966 },
    },
    {
      stat: Stat.PROSPECTING,
      customCalculateValue: statsFromCustomSet =>
        100 +
        (statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.CHANCE) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.PROSPECTING)
          : 0),
      icon: { backgroundPositionX: -97, backgroundPositionY: -279 },
    },
  ],
  [
    {
      stat: Stat.VITALITY,
      icon: { backgroundPositionX: -97, backgroundPositionY: -319 },
    },
    {
      stat: Stat.WISDOM,
      icon: { backgroundPositionX: -97, backgroundPositionY: -358 },
    },
    {
      stat: Stat.AGILITY,
      icon: { backgroundPositionX: -97, backgroundPositionY: -167 },
    },
    {
      stat: Stat.CHANCE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -89 },
    },
    {
      stat: Stat.STRENGTH,
      icon: { backgroundPositionX: -97, backgroundPositionY: -432 },
    },
    {
      stat: Stat.INTELLIGENCE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -394 },
    },
    {
      stat: Stat.POWER,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1108 },
    },
  ],
  [
    {
      stat: Stat.DODGE,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.AGILITY) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.DODGE)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -468 },
    },
    {
      stat: Stat.LOCK,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.AGILITY) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.LOCK)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -545 },
    },
  ],
  [
    {
      stat: Stat.AP_PARRY,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.AP_PARRY)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1064 },
    },
    {
      stat: Stat.AP_REDUCTION,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.AP_REDUCTION)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1297 },
    },
    {
      stat: Stat.MP_PARRY,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.MP_PARRY)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1016 },
    },
    {
      stat: Stat.MP_REDUCTION,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? Math.floor(
              getStatWithDefault(statsFromCustomSet, Stat.WISDOM) / 10,
            ) + getStatWithDefault(statsFromCustomSet, Stat.MP_REDUCTION)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1340 },
    },
  ],
  [
    {
      stat: Stat.NEUTRAL_DAMAGE,
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
            getStatWithDefault(statsFromCustomSet, Stat.NEUTRAL_DAMAGE)
          : 0,
      icon: { backgroundPositionX: -97, backgroundPositionY: -15 },
    },
    {
      stat: Stat.EARTH_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -432 },
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
            getStatWithDefault(statsFromCustomSet, Stat.EARTH_DAMAGE)
          : 0,
    },
    {
      stat: Stat.FIRE_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -394 },
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
            getStatWithDefault(statsFromCustomSet, Stat.FIRE_DAMAGE)
          : 0,
    },
    {
      stat: Stat.WATER_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -87 },
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
            getStatWithDefault(statsFromCustomSet, Stat.WATER_DAMAGE)
          : 0,
    },
    {
      stat: Stat.AIR_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -167 },
      customCalculateValue: statsFromCustomSet =>
        statsFromCustomSet
          ? getStatWithDefault(statsFromCustomSet, Stat.DAMAGE) +
            getStatWithDefault(statsFromCustomSet, Stat.AIR_DAMAGE)
          : 0,
    },
  ],
  [
    {
      stat: Stat.PCT_NEUTRAL_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -15 },
    },
    {
      stat: Stat.PCT_EARTH_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -432 },
    },
    {
      stat: Stat.PCT_FIRE_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -394 },
    },
    {
      stat: Stat.PCT_WATER_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -87 },
    },
    {
      stat: Stat.PCT_AIR_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -167 },
    },
  ],
  [
    {
      stat: Stat.TRAP_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -712 },
    },
    {
      stat: Stat.TRAP_POWER,
      icon: { backgroundPositionX: -97, backgroundPositionY: -673 },
    },
    {
      stat: Stat.REFLECT,
      icon: { backgroundPositionX: -97, backgroundPositionY: -791 },
    },
  ],
  [
    {
      stat: Stat.NEUTRAL_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -15 },
    },
    {
      stat: Stat.EARTH_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -432 },
    },
    {
      stat: Stat.FIRE_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -394 },
    },
    {
      stat: Stat.WATER_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -87 },
    },
    {
      stat: Stat.AIR_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -167 },
    },
  ],

  [
    {
      stat: Stat.CRITICAL_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1248 },
    },
    {
      stat: Stat.PUSHBACK_DAMAGE,
      icon: { backgroundPositionX: -97, backgroundPositionY: -872 },
    },
    {
      stat: Stat.PCT_MELEE_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Melee+Damage.svg',
    },
    {
      stat: Stat.PCT_RANGED_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Ranged+Damage.svg',
    },
    {
      stat: Stat.PCT_WEAPON_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Weapon+Damage.svg',
    },
    {
      stat: Stat.PCT_SPELL_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Spell+Damage.svg',
    },
  ],
  [
    {
      stat: Stat.CRITICAL_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -1202 },
    },
    {
      stat: Stat.PUSHBACK_RES,
      icon: { backgroundPositionX: -97, backgroundPositionY: -872 },
    },
    {
      stat: Stat.PCT_MELEE_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Melee+Resistance.svg',
    },
    {
      stat: Stat.PCT_RANGED_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Ranged+Resistance.svg',
    },
  ],
];
