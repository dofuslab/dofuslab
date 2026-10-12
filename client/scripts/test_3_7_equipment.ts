import assert from 'assert';
import {
  WeaponElementMage as Mage,
  WeaponEffectType as Effect,
} from '../__generated__/globalTypes';
import { countEquippedSets } from '../common/set-conditions';
import {
  calcElementMage,
  elementMageToWeaponEffect,
  getWeaponEffectMage,
  getWeaponMageOptions,
} from '../common/weapon-mage';

const pieces = (id: string, count: number) =>
  Array.from({ length: count }, () => ({ item: { set: { id } } }));
assert.equal(countEquippedSets(pieces('A', 7)), 1);
assert.equal(countEquippedSets([...pieces('A', 7), ...pieces('B', 1)]), 1);
assert.equal(countEquippedSets([...pieces('A', 7), ...pieces('B', 2)]), 2);
assert.equal(countEquippedSets([...pieces('A', 1), ...pieces('B', 1)]), 0);
assert.equal(countEquippedSets([{ item: { set: null } }]), 0);

for (const element of ['AIR', 'EARTH', 'FIRE', 'WATER']) {
  const full = Mage[`${element}_100` as keyof typeof Mage];
  const tenth = Mage[`${element}_10` as keyof typeof Mage];
  const oldFull = Mage[`${element}_85` as keyof typeof Mage];
  const oldTenth = Mage[`${element}_50` as keyof typeof Mage];
  assert.deepEqual(calcElementMage(full, 11, 30), {
    minDamage: 11,
    maxDamage: 30,
  });
  assert.deepEqual(
    calcElementMage(oldFull, 11, 30),
    calcElementMage(full, 11, 30),
  );
  assert.deepEqual(calcElementMage(tenth, 11, 30), {
    minDamage: 2,
    maxDamage: 3,
  });
  assert.deepEqual(
    calcElementMage(oldTenth, 11, 30),
    calcElementMage(tenth, 11, 30),
  );
  assert.equal(
    elementMageToWeaponEffect(full, Effect.NEUTRAL_HEALING),
    Effect[`${element}_HEALING` as keyof typeof Effect],
  );
  assert.equal(
    elementMageToWeaponEffect(full),
    Effect[`${element}_DAMAGE` as keyof typeof Effect],
  );
  assert.deepEqual(calcElementMage(tenth, 1, 1), {
    minDamage: null,
    maxDamage: 1,
  });
}
assert.equal(getWeaponMageOptions(true).length, 8);
assert.equal(getWeaponMageOptions(false).length, 12);
assert(!getWeaponMageOptions().some((mage) => /_(50|85)$/.test(mage)));
assert.equal(
  getWeaponEffectMage(Effect.NEUTRAL_DAMAGE, Mage.FIRE_10, Mage.WATER_100),
  Mage.FIRE_10,
);
assert.equal(
  getWeaponEffectMage(Effect.NEUTRAL_HEALING, Mage.FIRE_10, Mage.WATER_100),
  Mage.WATER_100,
);
assert.equal(
  getWeaponEffectMage(Effect.NEUTRAL_HEALING, Mage.FIRE_10, null),
  null,
);
assert.equal(
  getWeaponEffectMage(Effect.FIRE_DAMAGE, Mage.WATER_100, Mage.AIR_100),
  null,
);
console.log('3.7 set-condition and independent mage regression checks passed.');
