import assert from 'assert';

import {
  BUILD_DISCOVERY_EXO_STAT_MAP,
  buildDiscoveryExoLabels,
  buildDiscoveryHasExos,
  buildDiscoveryHasUnsupportedExos,
  buildDiscoveryImportItems,
  buildDiscoveryItemIds,
  buildDiscoveryNumberedSlotParts,
  buildDiscoveryRequestPayload,
  buildDiscoveryResultKey,
  buildDiscoveryVariablesFromInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  generationRequestDisplaySummary,
  generatedBuildName,
  generatedImportBlockMessage,
  normalizeBuildDiscoverySlotName,
  parseBuildDiscoveryJob,
  parseBuildDiscoveryResponse,
  readableGenerationSource,
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
assert.strictEqual(parseBuildDiscoveryJob(null), null);
assert.deepStrictEqual(
  parseBuildDiscoveryJob({
    id: 'job-key',
    status: 'succeeded',
    progress: 100,
    freshThresholdMs: 5000,
    elapsedMs: 6100,
    cacheHit: false,
    syncRecommended: false,
    asyncRecommended: true,
    generationRequestSource: 'build_discovery',
    datasetVersion: 'dataset-v1',
    solverVersion: 'solver-v1',
    requestPayload: {
      query: { className: 'Iop', elements: ['strength'] },
      resultKey: 'job-key',
    },
    result: {
      datasetVersion: 'dataset-v1',
      solverVersion: 'solver-v1',
      cacheKey: 'job-key',
      diagnostics: {
        elapsedMs: 6100,
        cacheHit: false,
        resultCount: 1,
      },
      warnings: [123, 'kept'],
      builds: [{ score: 42 }, null],
    },
  }),
  {
    id: 'job-key',
    status: 'succeeded',
    progress: 100,
    freshThresholdMs: 5000,
    elapsedMs: 6100,
    cacheHit: false,
    syncRecommended: false,
    asyncRecommended: true,
    generationRequestSource: 'build_discovery',
    datasetVersion: 'dataset-v1',
    solverVersion: 'solver-v1',
    requestPayload: {
      query: { className: 'Iop', elements: ['strength'] },
      resultKey: 'job-key',
    },
    result: {
      datasetVersion: 'dataset-v1',
      solverVersion: 'solver-v1',
      cacheKey: 'job-key',
      cache: undefined,
      status: undefined,
      query: undefined,
      targetSemantics: undefined,
      profile: undefined,
      target: undefined,
      scoring: undefined,
      warnings: ['kept'],
      diagnostics: {
        elapsedMs: 6100,
        cacheHit: false,
        appCacheHit: undefined,
        resultCount: 1,
        timings: undefined,
      },
      builds: [{ score: 42 }],
    },
  },
);

const buildWithExos = {
  exos: {
    AP: { itemId: 'ring-a', slot: 'ring_1' },
    Range: { itemId: 'shield-a', slot: 'shield' },
  },
  items: {
    ring_1: {
      id: 'ring-a',
      internalId: 'uuid-ring-a',
      name: 'Long Ring Name',
      type: 'Ring',
    },
    ring_2: {
      id: 'ring-a',
      internalId: 'uuid-ring-a-2',
      name: 'Long Ring Name',
      type: 'Ring',
    },
    shield: {
      id: 'shield-a',
      internalId: 'uuid-shield-a',
      name: 'Shield Name',
      type: 'Shield',
    },
  },
};

assert.deepStrictEqual(buildDiscoveryItemIds(buildWithExos), [
  'ring-a',
  'ring-a',
  'shield-a',
]);
assert.strictEqual(
  buildDiscoveryResultKey(buildWithExos),
  'score:ring-a:ring-a:shield-a',
);
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

assert.deepStrictEqual(buildDiscoveryImportItems(buildWithExos), {
  items: [
    {
      id: 'uuid-ring-a',
      apExo: true,
      mpExo: undefined,
      rangeExo: undefined,
    },
    {
      id: 'uuid-ring-a-2',
      apExo: undefined,
      mpExo: undefined,
      rangeExo: undefined,
    },
    {
      id: 'uuid-shield-a',
      apExo: undefined,
      mpExo: undefined,
      rangeExo: true,
    },
  ],
  hasMissingInternalIds: false,
  hasUnmatchedExos: false,
});
assert.deepStrictEqual(
  buildDiscoveryImportItems({
    items: {
      ring_2: {
        id: 'ring-b',
        internalId: 'uuid-ring-b-2',
        name: 'Second Ring',
      },
      shield: {
        id: 'shield-b',
        internalId: 'uuid-shield-b',
        name: 'Shield',
      },
      ring_1: {
        id: 'ring-a',
        internalId: 'uuid-ring-a-1',
        name: 'First Ring',
      },
    },
  }).items.map((item) => item.id),
  ['uuid-ring-a-1', 'uuid-ring-b-2', 'uuid-shield-b'],
);
assert.deepStrictEqual(
  buildDiscoveryImportItems({
    items: {
      ring_1: { id: 'ring-a', name: 'Ring Name' },
    },
  }),
  {
    items: [],
    hasMissingInternalIds: true,
    hasUnmatchedExos: false,
  },
);
assert.deepStrictEqual(
  buildDiscoveryImportItems({
    exos: {
      AP: { itemId: 'ring-a', slot: null },
    },
    items: {
      ring_1: {
        id: 'ring-a',
        internalId: 'uuid-ring-a',
        name: 'Ring Name',
      },
    },
  }),
  {
    items: [
      {
        id: 'uuid-ring-a',
        apExo: undefined,
        mpExo: undefined,
        rangeExo: undefined,
      },
    ],
    hasMissingInternalIds: false,
    hasUnmatchedExos: true,
  },
);
assert.strictEqual(
  generatedImportBlockMessage(true, false, false),
  'Open in builder is disabled because this result is missing generated item import IDs.',
);
assert.strictEqual(
  generatedImportBlockMessage(false, false, true),
  'Open in builder is disabled because generated exos could not be matched to one item slot.',
);

const importContext = {
  datasetVersion: 'dataset-v1',
  solverVersion: 'solver-v1',
  query: { className: 'Iop', elements: ['chance'] },
  input: { className: 'Iop' as const, element: 'strength' as const },
};
assert.strictEqual(
  generatedBuildName({ score: 123.4 }, importContext),
  'Generated Chance Iop #123',
);
assert.strictEqual(
  generatedBuildName({ score: 123.4 }, { input: {} }),
  'Generated Build Discovery #123',
);
assert.deepStrictEqual(
  buildDiscoveryRequestPayload(buildWithExos, importContext),
  {
    query: { className: 'Iop', elements: ['chance'] },
    build: {
      key: 'score:ring-a:ring-a:shield-a',
      score: undefined,
      itemIds: ['ring-a', 'ring-a', 'shield-a'],
      exos: {
        AP: { itemId: 'ring-a', slot: 'ring_1' },
        Range: { itemId: 'shield-a', slot: 'shield' },
      },
    },
  },
);
assert.strictEqual(
  readableGenerationSource('build_discovery', 'Build Discovery'),
  'Build Discovery',
);
assert.strictEqual(
  readableGenerationSource('build_discovery_oneoff_import'),
  'Build Discovery Oneoff Import',
);
assert.strictEqual(
  generationRequestDisplaySummary(
    {
      source: 'build_discovery',
      sourceLabel: 'Build Discovery',
      datasetVersion: 'dataset-v1',
      solverVersion: 'solver-v1',
      displaySummary:
        'Build Discovery - Iop chance 12/6/0 - dataset dataset-v1 - solver solver-v1',
    },
    'Build Discovery',
  ),
  'Build Discovery - Iop chance 12/6/0 - dataset dataset-v1 - solver solver-v1',
);
assert.strictEqual(
  generationRequestDisplaySummary({
    source: 'build_discovery_oneoff_import',
    sourceLabel: 'Build Discovery Oneoff Import',
  }),
  'Build Discovery Oneoff Import',
);
assert.strictEqual(
  generationRequestDisplaySummary({
    source: 'build_discovery_oneoff_import',
    datasetVersion: 'dataset-v1',
  }),
  'Build Discovery Oneoff Import - dataset dataset-v1',
);

console.log('Build Discovery client contract check passed.');
