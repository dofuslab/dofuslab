import { StatGroup } from './types';
import { Stat } from '__generated__/globalTypes';

export const DEBOUNCE_INTERVAL = 300;

export const BREAKPOINTS = [600, 900, 1200, 1450, 1650, 1900, 2100];

export const mq = BREAKPOINTS.map(bp => `@media (min-width: ${bp}px)`);

export const STAT_GROUPS: ReadonlyArray<StatGroup> = [
  [
    {
      stat: 'HP',
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Health_Point.svg',
    },
    {
      stat: Stat.AP,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Action_Point.svg',
    },
    {
      stat: Stat.MP,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Movement_Point.svg',
    },
    {
      stat: Stat.RANGE,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Range.svg',
    },
  ],
  [
    {
      stat: Stat.INITIATIVE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Initiative.svg',
    },
    {
      stat: Stat.CRITICAL,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Critical_Hit.svg',
    },
    {
      stat: Stat.SUMMON,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Summon.svg',
    },
    {
      stat: Stat.HEALS,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Heals.svg',
    },
    {
      stat: Stat.PROSPECTING,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Prospecting.svg',
    },
  ],
  [
    {
      stat: Stat.VITALITY,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Vitality.svg',
    },
    {
      stat: Stat.WISDOM,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Wisdom.svg',
    },
    {
      stat: Stat.AGILITY,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Agility.svg',
    },
    {
      stat: Stat.CHANCE,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Chance.svg',
    },
    {
      stat: Stat.STRENGTH,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Strength.svg',
    },
    {
      stat: Stat.INTELLIGENCE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Intelligence.svg',
    },
    {
      stat: Stat.POWER,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Power.svg',
    },
  ],
  [
    {
      stat: Stat.DODGE,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Dodge.svg',
    },
    {
      stat: Stat.LOCK,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Lock.svg',
    },
  ],
  [
    {
      stat: Stat.AP_PARRY,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/AP_Parry.svg',
    },
    {
      stat: Stat.AP_REDUCTION,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/AP_Reduction.svg',
    },
    {
      stat: Stat.MP_PARRY,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/MP_Parry.svg',
    },
    {
      stat: Stat.MP_REDUCTION,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/MP_Reduction.svg',
    },
  ],
  [
    {
      stat: Stat.NEUTRAL_DAMAGE,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral.svg',
    },
    {
      stat: Stat.EARTH_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Strength.svg',
    },
    {
      stat: Stat.FIRE_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Intelligence.svg',
    },
    {
      stat: Stat.WATER_DAMAGE,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Chance.svg',
    },
    {
      stat: Stat.AIR_DAMAGE,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Agility.svg',
    },
  ],
  [
    {
      stat: Stat.PCT_NEUTRAL_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral_square.svg',
    },
    {
      stat: Stat.PCT_EARTH_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Earth_square.svg',
    },
    {
      stat: Stat.PCT_FIRE_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Fire_square.svg',
    },
    {
      stat: Stat.PCT_WATER_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Water_square.svg',
    },
    {
      stat: Stat.PCT_AIR_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Air_square.svg',
    },
  ],
  [
    {
      stat: Stat.TRAP_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Trap_Damage.svg',
    },
    {
      stat: Stat.TRAP_POWER,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Trap_Power.svg',
    },
    {
      stat: Stat.REFLECT,
      svgIcon: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Reflect.svg',
    },
  ],
  [
    {
      stat: Stat.NEUTRAL_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral_square.svg',
    },
    {
      stat: Stat.EARTH_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Earth_square.svg',
    },
    {
      stat: Stat.FIRE_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Fire_square.svg',
    },
    {
      stat: Stat.WATER_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Water_square.svg',
    },
    {
      stat: Stat.AIR_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Air_square.svg',
    },
  ],

  [
    {
      stat: Stat.CRITICAL_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Critical_Damage.svg',
    },
    {
      stat: Stat.PUSHBACK_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Pushback_Damage.svg',
    },
    {
      stat: Stat.PCT_MELEE_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Melee_Damage.svg',
    },
    {
      stat: Stat.PCT_RANGED_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Ranged_Damage.svg',
    },
    {
      stat: Stat.PCT_WEAPON_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Weapon_Damage.svg',
    },
    {
      stat: Stat.PCT_SPELL_DAMAGE,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Spell_Damage.svg',
    },
  ],
  [
    {
      stat: Stat.CRITICAL_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Critical_Resistance.svg',
    },
    {
      stat: Stat.PUSHBACK_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Pushback_Resistance.svg',
    },
    {
      stat: Stat.PCT_MELEE_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Melee_Resistance.svg',
    },
    {
      stat: Stat.PCT_RANGED_RES,
      svgIcon:
        'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Ranged_Resistance.svg',
    },
  ],
];

export const SEARCH_BAR_ID = 'search-bar';
