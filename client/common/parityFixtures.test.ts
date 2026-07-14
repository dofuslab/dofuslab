import fs from 'node:fs';

import { Stat } from '__generated__/globalTypes';
import { describe, expect, it } from 'vitest';

import { evaluateFixtureCondition } from './conditionEvaluator';
import { calculateDamage, DamageStatTypes } from './damageCalculator';
import { TConditionObj } from './types';

const fixture = (name: string) =>
  JSON.parse(
    fs.readFileSync(
      new URL(`../../server/oneoff/fixtures/parity/${name}`, import.meta.url),
      'utf8',
    ),
  );

const damageFixtures = fixture('damage_cases.json') as {
  resistanceDecision: string;
  cases: Array<{
    name: string;
    baseDamage: number;
    element: keyof typeof ELEMENT_STATS;
    stats: Record<string, number>;
    flags: {
      isCrit?: boolean;
      isTrap?: boolean;
      isWeapon?: boolean;
      weaponSkillPower?: number;
      critBonusDamage?: number;
    };
    expected: { melee: number; ranged: number };
  }>;
};

const conditionFixtures = fixture('condition_cases.json') as {
  cases: Array<{
    name: string;
    condition: TConditionObj;
    stats: Record<string, number>;
    setCounts: Record<string, number>;
    expected: boolean;
  }>;
};

const ELEMENT_STATS: Record<string, DamageStatTypes> = {
  neutral: { multiplier: Stat.STRENGTH, damage: Stat.NEUTRAL_DAMAGE },
  earth: { multiplier: Stat.STRENGTH, damage: Stat.EARTH_DAMAGE },
  fire: { multiplier: Stat.INTELLIGENCE, damage: Stat.FIRE_DAMAGE },
  water: { multiplier: Stat.CHANCE, damage: Stat.WATER_DAMAGE },
  air: { multiplier: Stat.AGILITY, damage: Stat.AIR_DAMAGE },
};

const DAMAGE_STAT_NAMES: Record<string, Stat> = {
  Strength: Stat.STRENGTH,
  Intelligence: Stat.INTELLIGENCE,
  Chance: Stat.CHANCE,
  Agility: Stat.AGILITY,
  Power: Stat.POWER,
  'Neutral Damage': Stat.NEUTRAL_DAMAGE,
  'Earth Damage': Stat.EARTH_DAMAGE,
  'Fire Damage': Stat.FIRE_DAMAGE,
  'Water Damage': Stat.WATER_DAMAGE,
  'Air Damage': Stat.AIR_DAMAGE,
  Damage: Stat.DAMAGE,
  'Critical Damage': Stat.CRITICAL_DAMAGE,
  'Trap Power': Stat.TRAP_POWER,
  'Trap Damage': Stat.TRAP_DAMAGE,
  '% Final Damage': Stat.PCT_FINAL_DAMAGE,
  '% Weapon Damage': Stat.PCT_WEAPON_DAMAGE,
  '% Spell Damage': Stat.PCT_SPELL_DAMAGE,
  '% Melee Damage': Stat.PCT_MELEE_DAMAGE,
  '% Ranged Damage': Stat.PCT_RANGED_DAMAGE,
};

describe('shared damage parity fixtures', () => {
  it('documents resistance as outside the outgoing solver contract', () => {
    expect(damageFixtures.resistanceDecision).toContain(
      'outside the backend solver contract',
    );
  });

  it.each(damageFixtures.cases)('$name', (testCase) => {
    const stats = Object.fromEntries(
      Object.entries(testCase.stats).map(([name, value]) => [
        DAMAGE_STAT_NAMES[name],
        value,
      ]),
    );
    const result = calculateDamage(
      testCase.baseDamage,
      ELEMENT_STATS[testCase.element],
      stats,
      {
        isCrit: testCase.flags.isCrit || false,
        isTrap: testCase.flags.isTrap || false,
        isWeapon: testCase.flags.isWeapon || false,
      },
      testCase.flags.weaponSkillPower,
      testCase.flags.critBonusDamage,
    );

    expect(result).toEqual(testCase.expected);
  });
});

describe('shared condition parity fixtures', () => {
  it.each(conditionFixtures.cases)('$name', (testCase) => {
    expect(
      evaluateFixtureCondition(
        testCase.condition,
        testCase.stats,
        testCase.setCounts,
      ),
    ).toBe(testCase.expected);
  });
});
