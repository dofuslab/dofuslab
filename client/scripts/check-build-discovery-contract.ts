import assert from 'assert';

import {
  buildDiscoveryVariablesFromInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
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
  targetSemantics: undefined,
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

console.log('Build Discovery client contract check passed.');
