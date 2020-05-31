import {
  Stat,
  ItemFilters,
  WeaponEffectType,
  SpellEffectType,
} from '__generated__/globalTypes';
import { ItemSet, EquippedItem, CustomSet } from './type-aliases';

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
  | { type: 'STATS'; stats: Array<Stat> }
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

export type Theme = {
  name: string;
  body?: {
    background: string;
  };
  header?: {
    background?: string;
  };
  text?: {
    default?: string;
    light?: string;
    link?: {
      default?: string;
    };
    danger?: string;
    primary?: string;
  };
  border?: {
    default?: string;
    selected?: string;
    primarySelected?: string;
    light?: string;
  };
  layer?: {
    background?: string;
    backgroundLight?: string;
  };
  statEditor?: {
    categoryBackground?: string;
    remainingPointsBackground?: string;
  };
  damage?: {
    nonCrit?: {
      background?: string;
      color?: string;
    };
  };
  badge?: {
    background?: string;
  };
  scrollbar?: {
    trackBackground?: string;
    buttonBorder?: string;
    background?: string;
  };
  switch?: {
    background?: string;
    button?: string;
  };
  backTop?: {
    background?: string;
    hoverBackground?: string;
  };
  card?: {
    background?: string;
  };
};

type BaseEffect = {
  id: string;

  nonCrit: TEffectMinMax;
  crit: TEffectMinMax | null;
};

export interface UnconditionalEffect extends BaseEffect {
  condition: null;
}

export interface UnconditionalSpellEffect extends UnconditionalEffect {
  type: SpellEffectType;
}

export interface WeaponEffect extends UnconditionalEffect {
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

export interface BuildError {
  equippedItem: EquippedItem;
  reason: string;
}
