import {
  Stat,
  ItemFilters,
  WeaponEffectType,
  SpellEffectType,
  StatFilter,
} from '__generated__/globalTypes';
import {
  ItemSet,
  EquippedItem,
  CustomSet,
  Buff,
  Item,
  ClassBuffSpell,
} from './type-aliases';

export type StatWithCalculatedValue = {
  stat: string;
  icon?: {
    backgroundPositionX: number;
    backgroundPositionY: number;
  };
  svgIcon?: string;
};

export type StatGroup = Array<StatWithCalculatedValue>;

export type StatsFromCustomSet = {
  [key: string]: number;
};

export type StatCalculator = (
  statsFromCustomSet: StatsFromCustomSet | null,
  customSet?: CustomSet | null,
) => number;

export type SetCounter = {
  [key: string]: {
    count: number;
    set: ItemSet;
    equippedItems: Array<EquippedItem>;
  };
};

export type SharedFilterAction =
  | { type: 'SEARCH'; search: string }
  | { type: 'MAX_LEVEL'; maxLevel: number }
  | { type: 'QUICK_STATS'; stats: Array<Stat> }
  | { type: 'STATS'; stats: Array<StatFilter> }
  | { type: 'RESET'; maxLevel: number };

export type MageAction =
  | { type: 'ADD'; stat: Stat }
  | { type: 'REMOVE'; stat: Stat }
  | { type: 'EDIT'; isExo: boolean; stat: Stat; value: number }
  | { type: 'RESET'; originalStatsMap: { [key: string]: { value: number } } };

export interface OriginalStatLine {
  stat: Stat | null;
  maxValue?: number | null;
  value?: number;
}

export interface ExoStatLine {
  stat: Stat;
  value: number;
}

export type SharedFilters = Omit<ItemFilters, 'itemTypeIds'>;

const mobileScreenTypesArr = [
  'HOME',
  'EQUIPPED_ITEM',
  'ITEM_SELECTOR',
  'SET_SELECTOR',
] as const;

export type MobileScreen = typeof mobileScreenTypesArr[number];

export const mobileScreenTypes = mobileScreenTypesArr.reduce(
  (acc, curr) => ({ ...acc, [curr]: curr }),
  {},
) as { [key in MobileScreen]: MobileScreen };

export interface CalcDamageInput {
  isCrit?: boolean;
  isTrap?: boolean;
  isWeapon?: boolean;
}

export type TSimpleEffect =
  | 'damage'
  | 'pushback_damage'
  | 'heal'
  | 'shield'
  | 'ap'
  | 'mp';

type TEffectMinMax = { min: number | null; max: number; baseMax: number };

export type BaseEffect = {
  id: string;

  nonCrit: TEffectMinMax;
  crit: TEffectMinMax | null;
};

export interface UnconditionalSpellEffect extends BaseEffect {
  type: SpellEffectType;
  condition: null;
}

export interface WeaponEffect extends BaseEffect {
  type: WeaponEffectType;
}

export interface ConditionalEffect extends BaseEffect {
  condition: string;
}

export interface ConditionalSpellEffect extends ConditionalEffect {
  type: SpellEffectType;
}

export type TEffectLine =
  | UnconditionalSpellEffect
  | ConditionalSpellEffect
  | WeaponEffect;

export type TCondition = {
  stat: Stat | 'SET_BONUS';
  operator: '>' | '<';
  value: number;
};

export type TConditionObj =
  | {
      and?: Array<TConditionObj>;
      or?: Array<TConditionObj>;
    }
  | TCondition;

export type TEvaluatedConditionObj =
  | {
      and?: Array<TEvaluatedConditionObj>;
      or?: Array<TEvaluatedConditionObj>;
    }
  | boolean;

export const baseStats = [
  'baseVitality',
  'baseWisdom',
  'baseStrength',
  'baseIntelligence',
  'baseChance',
  'baseAgility',
] as const;

export const scrolledStats = [
  'scrolledVitality',
  'scrolledWisdom',
  'scrolledStrength',
  'scrolledIntelligence',
  'scrolledChance',
  'scrolledAgility',
] as const;

export const stats = [...baseStats, ...scrolledStats] as const;

export type BaseStatKey = typeof baseStats[number];

export type StatKey = typeof stats[number];

export interface AppliedBuff {
  buff: Buff;
  numStacks: number;
  numCritStacks: number;
  spell?: ClassBuffSpell;
  item?: Item;
}

export enum AppliedBuffActionType {
  ADD_STACK,
  MAX_STACKS,
  REMOVE_BUFF,
  CLEAR_ALL,
}

export type AppliedBuffAction =
  | {
      type: AppliedBuffActionType.ADD_STACK;
      buff: Buff;
      isCrit: boolean;
      spell?: ClassBuffSpell;
      item?: Item;
    }
  | {
      type: AppliedBuffActionType.MAX_STACKS;
      buff: Buff;
      isCrit: boolean;
      spell?: ClassBuffSpell;
      item?: Item;
    }
  | { type: AppliedBuffActionType.REMOVE_BUFF; buffId: string }
  | { type: AppliedBuffActionType.CLEAR_ALL };

export type StatsFromAppliedBuffs = {
  [key: string]: number;
};

export enum BuildErrorType {
  ConditionNotMet = 'CONDITION_NOT_MET',
  LevelTooHigh = 'LEVEL_TOO_HIGH',
  DuplicateItemInSet = 'DUPLICATE_ITEM_IN_SET',
  DuplicateDofusOrTrophy = 'DUPLICATE_DOFUS_OR_TROPHY',
  MultiplePrysmaradites = 'MULTIPLE_PRYSMARADITES',
  MultipleApExo = 'MULTIPLE_AP_EXO',
  MultipleMpExo = 'MULTIPLE_MP_EXO',
  MultipleRangeExo = 'MULTIPLE_RANGE_EXO',
}

export interface BuildError {
  equippedItem: EquippedItem;
  reason: BuildErrorType;
}

export interface CustomSetMetadata {
  isEditing: boolean;
  name: string;
  level: number;
}

export type CustomSetMetadataAction =
  | { type: 'START_EDIT'; originalState: CustomSetMetadata }
  | { type: 'EDIT_NAME'; name: string }
  | { type: 'EDIT_LEVEL'; level: number }
  | { type: 'STOP_EDIT' };

export type ProfileQueryParams = {
  [key: string]: string | undefined;
};
