import assert from 'assert';

import {
  BUILD_DISCOVERY_EXO_STAT_MAP,
  buildDiscoveryExoLabels,
  buildDiscoveryHasExos,
  buildDiscoveryHasUnsupportedExos,
  buildDiscoveryItemIds,
  buildDiscoveryNumberedSlotParts,
  buildDiscoveryVariablesFromInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  normalizeBuildDiscoverySlotName,
  parseBuildDiscoveryResponse,
} from '../common/buildDiscoveryContract';

const expectedDefaults = {
  className: 'Iop',
  level: 200,
  mode: 'pvm',
  element: 'strength',
  apTarget: 11,
  mpTarget: 6,
  rangeTarget: 0,
  damageSurvivabilityPreset: 3,
  budgetTier: 2,
  exoPolicy: 'allow',
  weaponPolicy: 'stat_stick_allowed',
  lockedItemIds: [],
  avoidedItemIds: [],
  limit: 5,
};

assert.deepStrictEqual(DEFAULT_BUILD_DISCOVERY_INPUT, expectedDefaults);

const defaultVariables = buildDiscoveryVariablesFromInput();
assert.deepStrictEqual(defaultVariables, {
  className: 'Iop',
  level: 200,
  mode: 'pvm',
  elements: ['strength'],
  apTarget: 11,
  mpTarget: 6,
  rangeTarget: 0,
  damageSurvivabilityPreset: 3,
  budgetTier: 2,
  exoPolicy: 'allow',
  weaponPolicy: 'stat_stick_allowed',
  lockedItemIds: [],
  avoidedItemIds: [],
  limit: 5,
});
assert.strictEqual('element' in defaultVariables, false);

assert.deepStrictEqual(
  buildDiscoveryVariablesFromInput({ element: 'chance' }),
  {
    ...defaultVariables,
    elements: ['chance'],
  },
);

assert.deepStrictEqual(
  buildDiscoveryVariablesFromInput({
    element: 'chance',
    elements: ['agility'],
  }),
  {
    ...defaultVariables,
    elements: ['agility'],
  },
);

assert.strictEqual(buildDiscoveryVariablesFromInput({ limit: 3 }).limit, 3);

const parsed = parseBuildDiscoveryResponse({
  datasetVersion: 'dataset-v1',
  solverVersion: 'solver-v1',
  cacheKey: 'cache-key',
  cache: { status: 'hit', storage: 'app_cache' },
  targetSemantics: {
    type: 'minimum_with_hard_caps',
    targets: {
      AP: 'minimum',
      MP: 'minimum',
      Range: 'minimum',
      Wisdom: 'minimum',
    },
    caps: {
      AP: 12,
      MP: 6,
      Range: 6,
      Wisdom: 999,
    },
    surplusScoring: 'light_reward_with_cap',
  },
  warnings: ['kept', 100],
  diagnostics: {
    elapsedMs: 0,
    cacheHit: true,
    appCacheHit: true,
    resultCount: 1,
    timings: { total: 1.5, ignored: 'nope' },
  },
  builds: [{ score: 10, totals: { ap: 11 } }, null],
});

assert.deepStrictEqual(parsed, {
  datasetVersion: 'dataset-v1',
  solverVersion: 'solver-v1',
  cacheKey: 'cache-key',
  cache: { status: 'hit', storage: 'app_cache' },
  status: undefined,
  query: undefined,
  targetSemantics: {
    type: 'minimum_with_hard_caps',
    targets: {
      AP: 'minimum',
      MP: 'minimum',
      Range: 'minimum',
    },
    caps: {
      AP: 12,
      MP: 6,
      Range: 6,
    },
    surplusScoring: 'light_reward_with_cap',
  },
  profile: undefined,
  target: undefined,
  scoring: undefined,
  warnings: ['kept'],
  diagnostics: {
    elapsedMs: 0,
    cacheHit: true,
    appCacheHit: true,
    resultCount: 1,
    timings: { total: 1.5 },
  },
  builds: [{ score: 10, totals: { ap: 11 } }],
});

const buildWithExos = {
  exos: {
    AP: { itemId: 'ring-a', slot: 'ring_1' },
    Range: { itemId: 'shield-a', slot: 'shield' },
  },
  items: {
    ring_1: { id: 'ring-a', name: 'Long Ring Name', type: 'Ring' },
    ring_2: { id: 'ring-a', name: 'Long Ring Name', type: 'Ring' },
    shield: { id: 'shield-a', name: 'Shield Name', type: 'Shield' },
  },
};

assert.deepStrictEqual(buildDiscoveryItemIds(buildWithExos), [
  'ring-a',
  'ring-a',
  'shield-a',
]);
assert.strictEqual(buildDiscoveryHasExos(buildWithExos), true);
assert.strictEqual(buildDiscoveryHasUnsupportedExos(buildWithExos), false);
assert.deepStrictEqual(BUILD_DISCOVERY_EXO_STAT_MAP, {
  AP: 'AP',
  MP: 'MP',
  Range: 'RANGE',
});
assert.deepStrictEqual(buildDiscoveryExoLabels(buildWithExos), [
  { key: 'AP:ring-a', label: 'AP exo - Long Ring Name' },
  { key: 'Range:shield-a', label: 'Range exo - Shield Name' },
]);
assert.deepStrictEqual(buildDiscoveryNumberedSlotParts('ring_2'), {
  family: 'ring',
  index: 1,
});
assert.deepStrictEqual(buildDiscoveryNumberedSlotParts('Ring'), {
  family: 'ring',
  index: null,
});
assert.strictEqual(normalizeBuildDiscoverySlotName('Dofus 6'), 'dofus6');
assert.strictEqual(
  buildDiscoveryHasUnsupportedExos({
    exos: { Wisdom: { itemId: 'hat-a', slot: 'hat' } },
  }),
  true,
);

console.log('Build Discovery client contract check passed.');
