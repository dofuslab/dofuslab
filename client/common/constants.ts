import { Stat } from '__generated__/globalTypes';

export const DEBOUNCE_INTERVAL = 300 as const;

export const BREAKPOINTS = [600, 900, 1200, 1450, 1650, 1900, 2100] as const;

export const mq = BREAKPOINTS.map((bp) => `@media (min-width: ${bp}px)`);

export const statIcons: { [key: string]: string } = {
  HP: 'icon/Health_Point.svg',
  [Stat.AP]: 'icon/Action_Point.svg',
  [Stat.MP]: 'icon/Movement_Point.svg',
  [Stat.RANGE]: 'icon/Range.svg',
  [Stat.INITIATIVE]: 'icon/Initiative.svg',
  [Stat.CRITICAL]: 'icon/Critical_Hit.svg',
  [Stat.SUMMON]: 'icon/Summon.svg',
  [Stat.HEALS]: 'icon/Heals.svg',
  [Stat.PROSPECTING]: 'icon/Prospecting.svg',
  [Stat.VITALITY]: 'icon/Vitality.svg',
  [Stat.WISDOM]: 'icon/Wisdom.svg',
  [Stat.AGILITY]: 'icon/Agility.svg',
  [Stat.CHANCE]: 'icon/Chance.svg',
  [Stat.STRENGTH]: 'icon/Strength.svg',
  [Stat.INTELLIGENCE]: 'icon/Intelligence.svg',
  [Stat.POWER]: 'icon/Power.svg',
  [Stat.DODGE]: 'icon/Dodge.svg',
  [Stat.LOCK]: 'icon/Lock.svg',
  [Stat.AP_PARRY]: 'icon/AP_Parry.svg',
  [Stat.AP_REDUCTION]: 'icon/AP_Reduction.svg',
  [Stat.MP_PARRY]: 'icon/MP_Parry.svg',
  [Stat.MP_REDUCTION]: 'icon/MP_Reduction.svg',
  [Stat.NEUTRAL_DAMAGE]: 'icon/Neutral.svg',
  [Stat.EARTH_DAMAGE]: 'icon/Strength.svg',
  [Stat.FIRE_DAMAGE]: 'icon/Intelligence.svg',
  [Stat.WATER_DAMAGE]: 'icon/Chance.svg',
  [Stat.AIR_DAMAGE]: 'icon/Agility.svg',
  [Stat.PCT_NEUTRAL_RES]: 'icon/Neutral_square.svg',
  [Stat.PCT_EARTH_RES]: 'icon/Earth_square.svg',
  [Stat.PCT_FIRE_RES]: 'icon/Fire_square.svg',
  [Stat.PCT_WATER_RES]: 'icon/Water_square.svg',
  [Stat.PCT_AIR_RES]: 'icon/Air_square.svg',
  [Stat.TRAP_DAMAGE]: 'icon/Trap_Damage.svg',
  [Stat.TRAP_POWER]: 'icon/Trap_Power.svg',
  [Stat.REFLECT]: 'icon/Reflect.svg',
  [Stat.PODS]: 'icon/Pods.svg',
  [Stat.NEUTRAL_RES]: 'icon/Neutral_square.svg',
  [Stat.EARTH_RES]: 'icon/Earth_square.svg',
  [Stat.FIRE_RES]: 'icon/Fire_square.svg',
  [Stat.WATER_RES]: 'icon/Water_square.svg',
  [Stat.AIR_RES]: 'icon/Air_square.svg',
  [Stat.CRITICAL_DAMAGE]: 'icon/Critical_Damage.svg',
  [Stat.PUSHBACK_DAMAGE]: 'icon/Pushback_Damage.svg',
  [Stat.PCT_MELEE_DAMAGE]: 'icon/Melee_Damage.svg',
  [Stat.PCT_RANGED_DAMAGE]: 'icon/Ranged_Damage.svg',
  [Stat.PCT_WEAPON_DAMAGE]: 'icon/Weapon_Damage.svg',
  [Stat.PCT_SPELL_DAMAGE]: 'icon/Spell_Damage.svg',
  [Stat.CRITICAL_RES]: 'icon/Critical_Resistance.svg',
  [Stat.PUSHBACK_RES]: 'icon/Pushback_Resistance.svg',
  [Stat.PCT_MELEE_RES]: 'icon/Melee_Resistance.svg',
  [Stat.PCT_RANGED_RES]: 'icon/Ranged_Resistance.svg',
  [Stat.DAMAGE]: 'icon/Damage.svg',
  [Stat.PCT_FINAL_DAMAGE]: 'icon/Final_Damage.svg',
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
    Stat.DAMAGE,
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
export const SETS_SEARCH_BAR_ID = 'sets-search';

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

export const MAX_LEVEL = 200;

export const PROFILE_PICTURES = [
  'profile-pictures/ProPic_Emerald_1.png',
  'profile-pictures/ProPic_Crimson_1.png',
  'profile-pictures/ProPic_Ebony_1.png',
  'profile-pictures/ProPic_Ivory_1.png',
  'profile-pictures/ProPic_Ochre_1.png',
  'profile-pictures/ProPic_Turquoise_1.png',
  'profile-pictures/ProPic_Iop_M.png',
  'profile-pictures/ProPic_Iop_F.png',
];

export const ITEMS_PAGE_SIZE = 24;
export const BUILD_LIST_PAGE_SIZE = 20;
