import { BuildDiscoveryElement } from 'common/buildDiscovery';

export const ELEMENTS: Array<{
  label: string;
  value: BuildDiscoveryElement;
}> = [
  { label: 'Strength', value: 'strength' },
  { label: 'Intelligence', value: 'intelligence' },
  { label: 'Chance', value: 'chance' },
  { label: 'Agility', value: 'agility' },
];

export const ELEMENT_STAT: Record<BuildDiscoveryElement, string> = {
  strength: 'Strength',
  intelligence: 'Intelligence',
  chance: 'Chance',
  agility: 'Agility',
};

export const PRESETS = [
  { label: 'Defensive', value: 1 },
  { label: 'Balanced', value: 2 },
  { label: 'Damage', value: 3 },
  { label: 'Glass cannon', value: 4 },
];

export const BUDGETS = [
  { label: 'Tier 1', value: 1 },
  { label: 'Tier 2', value: 2 },
  { label: 'Tier 3', value: 3 },
  { label: 'Opti', value: 4 },
];

export const RESULT_LIMITS = [
  { label: '1', value: 1 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
];

export const RANGE_OPTIONS = [
  { label: 'Any', value: 'any' },
  ...Array.from({ length: 7 }, (_, value) => ({
    label: `${value}+`,
    value: String(value),
  })),
];

export const SLOT_ORDER = [
  'hat',
  'cloak',
  'amulet',
  'ring_1',
  'ring_2',
  'belt',
  'boots',
  'weapon',
  'shield',
  'pet',
  'dofus_1',
  'dofus_2',
  'dofus_3',
  'dofus_4',
  'dofus_5',
  'dofus_6',
];

export const COMPARISON_STATS = [
  'AP',
  'MP',
  'Range',
  'Vitality',
  'Strength',
  'Intelligence',
  'Chance',
  'Agility',
  'Power',
  'Wisdom',
  'Critical',
  'Critical Damage',
  'Earth Damage',
  'Fire Damage',
  'Water Damage',
  'Air Damage',
  '% Spell Damage',
  '% Weapon Damage',
  '% Melee Damage',
  '% Ranged Damage',
];

export const STAT_ICON_KEYS: Record<string, string> = {
  AP: 'AP',
  MP: 'MP',
  Range: 'RANGE',
  Vitality: 'VITALITY',
  Strength: 'STRENGTH',
  Intelligence: 'INTELLIGENCE',
  Chance: 'CHANCE',
  Agility: 'AGILITY',
  Power: 'POWER',
  Wisdom: 'WISDOM',
  Critical: 'CRITICAL',
  'Critical Damage': 'CRITICAL_DAMAGE',
};
