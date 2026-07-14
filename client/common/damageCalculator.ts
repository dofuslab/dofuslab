import { Stat } from '__generated__/globalTypes';

import { CalcDamageInput, StatsFromCustomSet } from './types';

export interface DamageStatTypes {
  multiplier: Stat;
  damage: Stat;
}

const getStat = (stats: StatsFromCustomSet | null, stat: Stat) =>
  stats?.[stat] || 0;

export const calculateDamage = (
  baseDamage: number,
  statTypes: DamageStatTypes,
  stats: StatsFromCustomSet | null,
  damageTypeInput: CalcDamageInput,
  weaponSkillPower = 0,
  critBonusDamage = 0,
) => {
  let multiplierValue =
    getStat(stats, statTypes.multiplier) + getStat(stats, Stat.POWER);
  let damageValue =
    getStat(stats, statTypes.damage) + getStat(stats, Stat.DAMAGE);

  if (damageTypeInput.isTrap) {
    multiplierValue += getStat(stats, Stat.TRAP_POWER);
    damageValue += getStat(stats, Stat.TRAP_DAMAGE);
  }
  if (damageTypeInput.isCrit) {
    damageValue += getStat(stats, Stat.CRITICAL_DAMAGE) + critBonusDamage;
  }
  if (damageTypeInput.isWeapon) {
    multiplierValue += weaponSkillPower;
  }

  const calculatedDamage = Math.floor(
    baseDamage * (1 + multiplierValue / 100) + damageValue,
  );
  let finalDamageMod = 1 + getStat(stats, Stat.PCT_FINAL_DAMAGE) / 100;
  finalDamageMod *= damageTypeInput.isWeapon
    ? 1 + getStat(stats, Stat.PCT_WEAPON_DAMAGE) / 100
    : 1 + getStat(stats, Stat.PCT_SPELL_DAMAGE) / 100;

  return {
    melee: Math.floor(
      calculatedDamage *
        (finalDamageMod * (1 + getStat(stats, Stat.PCT_MELEE_DAMAGE) / 100)),
    ),
    ranged: Math.floor(
      calculatedDamage *
        (finalDamageMod * (1 + getStat(stats, Stat.PCT_RANGED_DAMAGE) / 100)),
    ),
  };
};
