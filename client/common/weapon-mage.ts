import {
  WeaponElementMage,
  WeaponEffectType,
} from '../__generated__/globalTypes';

const mageDetails = (mage: WeaponElementMage) => {
  const [element, storedRate] = mage.split('_');
  const percentage = { '85': 100, '50': 10 }[storedRate] ?? Number(storedRate);
  if (
    !['EARTH', 'FIRE', 'WATER', 'AIR'].includes(element) ||
    ![10, 68, 100].includes(percentage)
  ) {
    throw new Error('Unknown WeaponElementMage');
  }
  return { element, percentage };
};

export const getWeaponMageOptions = (healing = false) =>
  Object.values(WeaponElementMage).filter((mage) =>
    (healing ? ['100', '10'] : ['100', '68', '10']).includes(
      mage.split('_')[1],
    ),
  );

export const getWeaponEffectMage = (
  effectType: WeaponEffectType,
  damageMage?: WeaponElementMage | null,
  healingMage?: WeaponElementMage | null,
) => {
  if (effectType === WeaponEffectType.NEUTRAL_DAMAGE) return damageMage;
  if (effectType === WeaponEffectType.NEUTRAL_HEALING) return healingMage;
  return null;
};

export const elementMageToWeaponEffect = (
  mage: WeaponElementMage,
  neutralEffectType:
    | WeaponEffectType.NEUTRAL_DAMAGE
    | WeaponEffectType.NEUTRAL_HEALING = WeaponEffectType.NEUTRAL_DAMAGE,
) => {
  const suffix =
    neutralEffectType === WeaponEffectType.NEUTRAL_HEALING
      ? 'HEALING'
      : 'DAMAGE';
  return WeaponEffectType[
    `${mageDetails(mage).element}_${suffix}` as keyof typeof WeaponEffectType
  ];
};

export const calcElementMage = (
  mage: WeaponElementMage,
  baseMin: number,
  baseMax: number,
) => {
  const multiplier = mageDetails(mage).percentage / 100;
  if (multiplier === 1) return { minDamage: baseMin, maxDamage: baseMax };
  const base = Math.floor((baseMin - 1) * multiplier);
  const diff = Math.max(1, Math.floor((baseMax - baseMin + 1) * multiplier));
  return { minDamage: diff === 1 ? null : base + 1, maxDamage: base + diff };
};
