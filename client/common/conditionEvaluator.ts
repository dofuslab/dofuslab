import { TCondition, TConditionObj } from './types';

export const CONDITION_STAT_TO_STAT_NAME: Record<string, string> = {
  AP: 'AP',
  MP: 'MP',
  RANGE: 'Range',
  VITALITY: 'Vitality',
  WISDOM: 'Wisdom',
  STRENGTH: 'Strength',
  INTELLIGENCE: 'Intelligence',
  CHANCE: 'Chance',
  AGILITY: 'Agility',
  CRITICAL: 'Critical',
  DODGE: 'Dodge',
  LOCK: 'Lock',
  POWER: 'Power',
  DAMAGE: 'Damage',
  EARTH_DAMAGE: 'Earth Damage',
  NEUTRAL_DAMAGE: 'Neutral Damage',
  FIRE_DAMAGE: 'Fire Damage',
  WATER_DAMAGE: 'Water Damage',
  AIR_DAMAGE: 'Air Damage',
};

export const isLeafCondition = (
  conditionObj: TConditionObj,
): conditionObj is TCondition => {
  const condition = conditionObj as TCondition;
  return !!(
    condition.operator &&
    condition.stat &&
    condition.value !== null &&
    condition.value !== undefined
  );
};

export const traverseConditions = (
  conditionObj: TConditionObj,
  evaluateLeaf: (condition: TCondition) => boolean,
): boolean => {
  if (!conditionObj || Object.keys(conditionObj).length === 0) {
    return true;
  }
  if (isLeafCondition(conditionObj)) {
    return evaluateLeaf(conditionObj);
  }
  if (conditionObj.and?.length) {
    return conditionObj.and.every((child) =>
      traverseConditions(child, evaluateLeaf),
    );
  }
  if (conditionObj.or?.length) {
    return conditionObj.or.some((child) =>
      traverseConditions(child, evaluateLeaf),
    );
  }
  return true;
};

export const evaluateConditions = (
  conditionObj: TConditionObj,
  resolveValue: (condition: TCondition) => number,
) =>
  traverseConditions(conditionObj, (condition) => {
    const value = resolveValue(condition);

    if (condition.operator === '<') {
      return value < condition.value;
    }
    if (condition.operator === '>') {
      return value > condition.value;
    }
    return true;
  });

export const evaluateFixtureCondition = (
  conditionObj: TConditionObj,
  stats: Record<string, number>,
  setCounts: Record<string, number>,
) =>
  evaluateConditions(conditionObj, (condition) =>
    condition.stat === 'SET_BONUS'
      ? Object.values(setCounts).reduce(
          (total, count) => total + Math.max(count - 1, 0),
          0,
        )
      : stats[CONDITION_STAT_TO_STAT_NAME[condition.stat] || ''] || 0,
  );
