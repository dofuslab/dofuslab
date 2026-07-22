import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  buildItemSuggestionVariables,
  getItemSuggestionRequestKey,
  getVisibleItemSuggestions,
  groupItemSuggestionsBySlot,
} from './itemSuggestionUtils';

const uuid1 = '11111111-1111-4111-8111-111111111111';
const uuid2 = '22222222-2222-4222-8222-222222222222';
const slots = [
  { id: 'hat', itemTypes: [{ id: 'headwear' }] },
  { id: 'ring', itemTypes: [{ id: 'ring' }, { id: 'shared' }] },
];

const variables = buildItemSuggestionVariables(
  199,
  [
    { id: uuid1, slot: { enName: 'Hat' } },
    { id: uuid2, slot: { enName: 'Dofus' } },
    { id: 'equipped-item-ring', slot: { enName: 'Ring' } },
  ],
  slots,
);

assert.deepStrictEqual(variables, {
  equippedItemIds: [uuid1],
  eligibleItemTypeIds: ['headwear', 'ring', 'shared'],
  level: 199,
  numSuggestions: 50,
});
assert.strictEqual(
  buildItemSuggestionVariables(
    200,
    [{ id: 'equipped-item-hat', slot: { enName: 'Hat' } }],
    slots,
  ).equippedItemIds.length,
  0,
);
assert.strictEqual(
  getItemSuggestionRequestKey('build', variables, slots),
  getItemSuggestionRequestKey(
    'build',
    {
      ...variables,
      eligibleItemTypeIds: [...variables.eligibleItemTypeIds].reverse(),
    },
    [...slots].reverse(),
  ),
  'request keys should ignore input ordering',
);
assert.notStrictEqual(
  getItemSuggestionRequestKey('build', variables, slots),
  getItemSuggestionRequestKey(
    'build',
    {
      ...variables,
      equippedItemIds: [uuid2],
    },
    slots,
  ),
  'request keys should change with build composition',
);

const visibleResult = {
  requestKey: 'composition-a',
  suggestionsBySlot: { hat: [{ id: 'one' }] },
};
assert.deepStrictEqual(
  getVisibleItemSuggestions('composition-a', visibleResult),
  visibleResult.suggestionsBySlot,
);
assert.deepStrictEqual(
  getVisibleItemSuggestions('composition-b', visibleResult),
  {},
  'results from a previous composition must not remain actionable',
);
assert.deepStrictEqual(
  getVisibleItemSuggestions(null, visibleResult),
  {},
  'results must be hidden while there is no eligible request',
);

const ranked = [
  { id: 'one', itemType: { id: 'shared' } },
  { id: 'two', itemType: { id: 'headwear' } },
  { id: 'three', itemType: { id: 'ring' } },
];
const grouped = groupItemSuggestionsBySlot(slots, ranked, 2);
assert.deepStrictEqual(grouped.hat.map(({ id }) => id), ['two']);
assert.deepStrictEqual(grouped.ring.map(({ id }) => id), ['one', 'three']);

const clientRoot = path.resolve(__dirname, '../..');
assert.ok(
  !fs
    .readFileSync(path.join(clientRoot, 'graphql/queries/items.graphql'), 'utf8')
    .includes('itemSuggestions'),
  'items.graphql must remain suggestion-free',
);
assert.ok(
  fs
    .readFileSync(
      path.join(clientRoot, 'components/common/useItemSuggestions.ts'),
      'utf8',
    )
    .includes("addEventListener('online'"),
  'suggestion prefetch should recover when the browser reconnects',
);
assert.ok(
  !fs
    .readFileSync(path.join(clientRoot, 'components/common/ItemSelector.tsx'), 'utf8')
    .includes('itemSuggestions'),
  'ItemSelector must remain suggestion-free',
);

console.log('item suggestion helper tests passed');
