import { Stat } from '__generated__/globalTypes';

export const DEBOUNCE_INTERVAL = 300;

export const BREAKPOINTS = [600, 900, 1200, 1450, 1650, 1900, 2100];

export const mq = BREAKPOINTS.map((bp) => `@media (min-width: ${bp}px)`);

export const statIcons: { [key: string]: string } = {
  HP: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Health_Point.svg',
  [Stat.AP]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Action_Point.svg',
  [Stat.MP]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Movement_Point.svg',
  [Stat.RANGE]: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Range.svg',
  [Stat.INITIATIVE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Initiative.svg',
  [Stat.CRITICAL]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Critical_Hit.svg',
  [Stat.SUMMON]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Summon.svg',
  [Stat.HEALS]: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Heals.svg',
  [Stat.PROSPECTING]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Prospecting.svg',
  [Stat.VITALITY]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Vitality.svg',
  [Stat.WISDOM]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Wisdom.svg',
  [Stat.AGILITY]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Agility.svg',
  [Stat.CHANCE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Chance.svg',
  [Stat.STRENGTH]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Strength.svg',
  [Stat.INTELLIGENCE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Intelligence.svg',
  [Stat.POWER]: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Power.svg',
  [Stat.DODGE]: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Dodge.svg',
  [Stat.LOCK]: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Lock.svg',
  [Stat.AP_PARRY]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/AP_Parry.svg',
  [Stat.AP_REDUCTION]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/AP_Reduction.svg',
  [Stat.MP_PARRY]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/MP_Parry.svg',
  [Stat.MP_REDUCTION]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/MP_Reduction.svg',
  [Stat.NEUTRAL_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral.svg',
  [Stat.EARTH_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Strength.svg',
  [Stat.FIRE_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Intelligence.svg',
  [Stat.WATER_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Chance.svg',
  [Stat.AIR_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Agility.svg',
  [Stat.PCT_NEUTRAL_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral_square.svg',
  [Stat.PCT_EARTH_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Earth_square.svg',
  [Stat.PCT_FIRE_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Fire_square.svg',
  [Stat.PCT_WATER_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Water_square.svg',
  [Stat.PCT_AIR_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Air_square.svg',
  [Stat.TRAP_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Trap_Damage.svg',
  [Stat.TRAP_POWER]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Trap_Power.svg',
  [Stat.REFLECT]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Reflect.svg',
  [Stat.PODS]: 'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Pods.svg',
  [Stat.NEUTRAL_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Neutral_square.svg',
  [Stat.EARTH_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Earth_square.svg',
  [Stat.FIRE_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Fire_square.svg',
  [Stat.WATER_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Water_square.svg',
  [Stat.AIR_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Air_square.svg',
  [Stat.CRITICAL_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Critical_Damage.svg',
  [Stat.PUSHBACK_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Pushback_Damage.svg',
  [Stat.PCT_MELEE_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Melee_Damage.svg',
  [Stat.PCT_RANGED_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Ranged_Damage.svg',
  [Stat.PCT_WEAPON_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Weapon_Damage.svg',
  [Stat.PCT_SPELL_DAMAGE]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Spell_Damage.svg',
  [Stat.CRITICAL_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Critical_Resistance.svg',
  [Stat.PUSHBACK_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Pushback_Resistance.svg',
  [Stat.PCT_MELEE_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Melee_Resistance.svg',
  [Stat.PCT_RANGED_RES]:
    'https://dofus-lab.s3.us-east-2.amazonaws.com/icons/Ranged_Resistance.svg',
};

export const classicStatGroups = [
  ['HP', Stat.AP, Stat.MP, Stat.RANGE],
  [Stat.INITIATIVE, Stat.CRITICAL, Stat.SUMMON, Stat.HEALS, Stat.PROSPECTING],
  [
    Stat.VITALITY,
    Stat.WISDOM,
    Stat.AGILITY,
    Stat.CHANCE,
    Stat.STRENGTH,
    Stat.INTELLIGENCE,
    Stat.POWER,
  ],
  [Stat.DODGE, Stat.LOCK],
  [Stat.AP_PARRY, Stat.AP_REDUCTION, Stat.MP_PARRY, Stat.MP_REDUCTION],
  [
    Stat.NEUTRAL_DAMAGE,
    Stat.EARTH_DAMAGE,
    Stat.FIRE_DAMAGE,
    Stat.WATER_DAMAGE,
    Stat.AIR_DAMAGE,
  ],
  [
    Stat.PCT_NEUTRAL_RES,
    Stat.PCT_EARTH_RES,
    Stat.PCT_FIRE_RES,
    Stat.PCT_WATER_RES,
    Stat.PCT_AIR_RES,
  ],
  [Stat.TRAP_DAMAGE, Stat.TRAP_POWER, Stat.REFLECT, Stat.PODS],
  [
    Stat.NEUTRAL_RES,
    Stat.EARTH_RES,
    Stat.FIRE_RES,
    Stat.WATER_RES,
    Stat.AIR_RES,
  ],

  [
    Stat.CRITICAL_DAMAGE,
    Stat.PUSHBACK_DAMAGE,
    Stat.PCT_MELEE_DAMAGE,
    Stat.PCT_RANGED_DAMAGE,
    Stat.PCT_WEAPON_DAMAGE,
    Stat.PCT_SPELL_DAMAGE,
  ],
  [
    Stat.CRITICAL_RES,
    Stat.PUSHBACK_RES,
    Stat.PCT_MELEE_RES,
    Stat.PCT_RANGED_RES,
  ],
];

export const SEARCH_BAR_ID = 'search-bar';

export const DISCORD_SERVER_LINK = 'https://discord.gg/S4TvSfa';
export const GITHUB_REPO_LINK = 'https://github.com/dofuslab/dofuslab';
export const BUY_ME_COFFEE_LINK = 'https://www.buymeacoffee.com/dofuslab';

export const EMAIL_REGEX = /[^@]+@[^@]+\.[^@]+/;
// https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
export const DISPLAY_NAME_REGEX = /^(?=[a-zA-Z0-9._]{3,20}$).*$/;
export const CONSECUTIVE_SEPARATOR_REGEX = /^(?!.*?[._]{2})[a-zA-Z0-9_.]+$/;
export const VALID_START_END_REGEX = /[^_.].*[^_.]$/;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const META_DESCRIPTION =
  'Experiment with your equipment at DofusLab, the open-source set builder for the MMORPG Dofus.';

export const getSelectorNumCols = (isClassic?: boolean) =>
  isClassic ? [2, 3, 4, 5, 6, 7, 8] : [2, 2, 2, 3, 4, 5, 6];

export const IS_CLASSIC_STORAGE_KEY = 'isClassic';
