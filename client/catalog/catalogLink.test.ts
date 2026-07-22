import 'fake-indexeddb/auto';
import assert from 'assert';
import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
} from '@apollo/client';

import { createCatalogLink, deriveCatalogManifestUrl } from './link';
import {
  clearCatalogMemoryForTests,
  loadStoredCatalogBundle,
  storeCatalog,
  storeCatalogBundle,
} from './persistence';
import { CatalogItem, CatalogSet } from './types';

globalThis.fetch = (async () => new Response(JSON.stringify({
  schemaVersion: 2,
  version: 'test-revision',
}), { status: 200 })) as typeof fetch;

const itemType = {
  __typename: 'ItemType' as const,
  id: 'type-1',
  name: 'Hat',
  searchNames: ['Hat'],
  enName: 'Hat',
  eligibleItemSlots: [
    { __typename: 'ItemSlot' as const, id: 'slot-1', enName: 'Hat', order: 1 },
  ],
};

function item(
  id: string,
  name: string,
  level: number,
  searchNames: string[] = [name],
): CatalogItem {
  return {
    __typename: 'Item',
    id,
    name,
    searchNames,
    level,
    imageUrl: `${id}.png`,
    conditions: null,
    stats: [],
    weaponStats: null,
    itemType,
    set: null,
    buffs: [],
  };
}

function withoutTypenames<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => withoutTypenames(entry)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== '__typename')
        .map(([key, entry]) => [key, withoutTypenames(entry)]),
    ) as T;
  }
  return value;
}

const catalogItems = [
  item('item-1', 'Alpha', 200, ['Alpha', 'Alfa']),
  item('item-2', 'Beta', 190),
  item('item-3', 'Gamma', 180, ['Gamma', 'Gama']),
];

const catalogSets: CatalogSet[] = [
  {
    __typename: 'Set',
    id: 'set-1',
    name: 'Alpha Set',
    searchNames: ['Alpha Set', 'Conjunto Alfa'],
    items: catalogItems,
    bonuses: [],
  },
];

catalogItems[1].set = {
  __typename: 'Set',
  id: 'set-1',
  name: 'Alpha Set',
  searchNames: ['Alpha Set', 'Conjunto Alfa'],
  bonuses: [],
};

const ITEMS_QUERY = gql`
  query items(
    $first: Int!
    $after: String
    $filters: ItemFilters!
  ) {
    items(first: $first, after: $after, filters: $filters) {
      edges {
        cursor
        node {
          id
          name
          searchNames
          level
          imageUrl
          conditions
          stats { id order minValue maxValue stat customStat }
          weaponStats { id }
          itemType {
            id
            name
            enName
            eligibleItemSlots { id enName order }
          }
          set { id name searchNames bonuses { id numItems stat value customStat } }
          buffs { id stat incrementBy critIncrementBy maxStacks }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const SETS_QUERY = gql`
  query sets($first: Int!, $after: String, $filters: SetFilters!) {
    sets(first: $first, after: $after, filters: $filters) {
      edges {
        cursor
        node {
          id
          name
          searchNames
          bonuses { id numItems stat value customStat }
          items {
            id
            name
            searchNames
            level
            imageUrl
            conditions
            stats { id order minValue maxValue stat customStat }
            weaponStats { id }
            itemType {
              id
              name
              enName
              eligibleItemSlots { id enName order }
            }
            set { id name searchNames bonuses { id numItems stat value customStat } }
            buffs { id stat incrementBy critIncrementBy maxStacks }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const SET_QUERY = gql`
  query set($id: UUID!) {
    setById(id: $id) {
      id
      name
      bonuses { id numItems stat value customStat }
      items { id name level }
    }
  }
`;

async function storedKeysForLocale(locale: string): Promise<string[]> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('dofuslab-local-catalog', 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('catalogs', 'readonly');
      const request = transaction.objectStore('catalogs').getAllKeys();
      request.onsuccess = () => resolve(
        request.result.map(String).filter((key) => key.startsWith(`2:${locale}:`)),
      );
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

async function main() {
  assert.strictEqual(
    deriveCatalogManifestUrl('/prefix/api/graphql?operation=items'),
    '/prefix/api/catalog/manifest.json',
  );
  assert.strictEqual(
    deriveCatalogManifestUrl('https://api.example.test/custom/graphql?token=x'),
    'https://api.example.test/api/catalog/manifest.json',
  );
  assert.strictEqual(
    deriveCatalogManifestUrl('/custom/graphql'),
    '/api/catalog/manifest.json',
  );

  let manifestFallbackForwards = 0;
  const manifestFallbackCache = new InMemoryCache();
  const manifestFallbackClient = new ApolloClient({
    cache: manifestFallbackCache,
    link: ApolloLink.from([
      createCatalogLink('manifest-failure', manifestFallbackCache, {
        fetchManifest: async () => {
          throw new Error('Catalog manifest returned 404');
        },
      }),
      new ApolloLink(() => new Observable((observer) => {
        manifestFallbackForwards += 1;
        observer.next({
          data: {
            items: {
              __typename: 'ItemConnection',
              edges: [{
                __typename: 'ItemEdge',
                cursor: 'online-item',
                node: catalogItems[0],
              }],
              pageInfo: {
                __typename: 'PageInfo',
                hasNextPage: false,
                endCursor: null,
              },
            },
          },
        });
        observer.complete();
      })),
    ]),
  });
  const manifestFallbackResult = await manifestFallbackClient.query({
    query: ITEMS_QUERY,
    variables: {
      first: 2,
      filters: { stats: [], maxLevel: 200, search: '', itemTypeIds: [] },
    },
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(
    manifestFallbackResult.data.items.edges[0].node.name,
    'Alpha',
    'a manifest outage falls through to the normal online result',
  );
  assert.strictEqual(manifestFallbackForwards, 1);

  let forwarded = 0;
  const network = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        forwarded += 1;
        if (
          operation.operationName === 'items' ||
          operation.operationName === 'catalogItems'
        ) {
          observer.next({
            data: {
              items: {
                __typename: 'ItemConnection',
                edges: catalogItems.map((node, index) => ({
                  __typename: 'ItemEdge',
                  cursor: String(index),
                  node,
                })),
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          });
        } else if (
          operation.operationName === 'sets' ||
          operation.operationName === 'catalogSets'
        ) {
          observer.next({
            data: {
              sets: {
                __typename: 'SetConnection',
                edges: catalogSets.map((node, index) => ({
                  __typename: 'SetEdge',
                  cursor: String(index),
                  node,
                })),
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          });
        } else {
          observer.error(new Error(`Unexpected network operation: ${operation.operationName}`));
          return;
        }
        observer.complete();
      }),
  );
  const cache = new InMemoryCache();
  const client = new ApolloClient({
    cache,
    link: ApolloLink.from([createCatalogLink('en', cache), network]),
  });

  const itemVariables = {
    first: 2,
    filters: { stats: [], maxLevel: 200, search: '', itemTypeIds: [] },
  };
  const firstPage = await client.query({
    query: ITEMS_QUERY,
    variables: itemVariables,
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    firstPage.data.items.edges.map((edge: { node: CatalogItem }) => edge.node.name),
    ['Alpha', 'Beta'],
  );
  assert.strictEqual(firstPage.data.items.pageInfo.hasNextPage, true);
  assert.strictEqual(forwarded, 1, 'only the initial item bootstrap uses the network');

  cache.writeFragment({
    id: 'Item:item-1',
    fragment: gql`fragment newerNetworkItem on Item { id name level }`,
    data: { __typename: 'Item', id: 'item-1', name: 'Network Alpha', level: 200 },
  });
  const reconciled = await client.query({
    query: ITEMS_QUERY,
    variables: itemVariables,
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(
    reconciled.data.items.edges[0].node.name,
    'Network Alpha',
    'a complete normalized network entity wins over the stored snapshot',
  );
  assert.strictEqual(
    Object.keys(cache.extract()).filter((key) => key === 'Item:item-1').length,
    1,
    'network and local results reconcile to one Item identity',
  );
  assert.strictEqual(forwarded, 1, 'cache reconciliation does not forward');

  const filtered = await client.query({
    query: ITEMS_QUERY,
    variables: {
      ...itemVariables,
      filters: { ...itemVariables.filters, search: 'gamma' },
    },
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    filtered.data.items.edges.map((edge: { node: CatalogItem }) => edge.node.id),
    ['item-3'],
  );
  assert.strictEqual(forwarded, 1, 'item filtering is local after bootstrap');

  const translatedItem = await client.query({
    query: ITEMS_QUERY,
    variables: {
      ...itemVariables,
      filters: { ...itemVariables.filters, search: 'gama' },
    },
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    translatedItem.data.items.edges.map((edge: { node: CatalogItem }) => ({
      id: edge.node.id,
      name: edge.node.name,
    })),
    [{ id: 'item-3', name: 'Gamma' }],
    'an alternate-language match keeps the localized Apollo display name',
  );
  assert.strictEqual(forwarded, 1, 'translated item filtering stays local');

  const translatedContainingSet = await client.query({
    query: ITEMS_QUERY,
    variables: {
      ...itemVariables,
      filters: { ...itemVariables.filters, search: 'conjunto' },
    },
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    translatedContainingSet.data.items.edges.map(
      (edge: { node: CatalogItem }) => edge.node.id,
    ),
    ['item-2'],
    'item search matches every translation of its containing set',
  );

  const setVariables = {
    first: 12,
    filters: { stats: [], maxLevel: 200, search: '', itemTypeIdGroups: [] },
  };
  await client.query({
    query: SETS_QUERY,
    variables: setVariables,
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(forwarded, 2, 'sets bootstrap independently once');

  const translatedSet = await client.query({
    query: SETS_QUERY,
    variables: {
      ...setVariables,
      filters: { ...setVariables.filters, search: 'conjunto' },
    },
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    translatedSet.data.sets.edges.map((edge: { node: CatalogSet }) => ({
      id: edge.node.id,
      name: edge.node.name,
    })),
    [{ id: 'set-1', name: 'Alpha Set' }],
    'an alternate-language set match keeps the localized display name',
  );
  assert.strictEqual(forwarded, 2, 'translated set filtering stays local');

  const translatedSetItem = await client.query({
    query: SETS_QUERY,
    variables: {
      ...setVariables,
      filters: { ...setVariables.filters, search: 'gama' },
    },
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    translatedSetItem.data.sets.edges.map((edge: { node: CatalogSet }) => edge.node.id),
    ['set-1'],
    'set search matches every translation of its member items',
  );

  const detail = await client.query({
    query: SET_QUERY,
    variables: { id: 'set-1' },
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(detail.data.setById.name, 'Alpha Set');
  assert.strictEqual(forwarded, 2, 'set detail is served from the local catalog');

  let directSetForwards = 0;
  const directSetCache = new InMemoryCache();
  const directSetClient = new ApolloClient({
    cache: directSetCache,
    link: ApolloLink.from([
      createCatalogLink('fr', directSetCache),
      new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            directSetForwards += 1;
            assert.strictEqual(operation.operationName, 'catalogSets');
            observer.next({
              data: {
                sets: {
                  __typename: 'SetConnection',
                  edges: catalogSets.map((node, index) => ({
                    __typename: 'SetEdge',
                    cursor: String(index),
                    node,
                  })),
                  pageInfo: {
                    __typename: 'PageInfo',
                    hasNextPage: false,
                    endCursor: null,
                  },
                },
              },
            });
            observer.complete();
          }),
      ),
    ]),
  });
  const directDetail = await directSetClient.query({
    query: SET_QUERY,
    variables: { id: 'set-1' },
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(directDetail.data.setById.id, 'set-1');
  assert.strictEqual(directSetForwards, 1, 'direct detail bootstraps sets once');

  await storeCatalog('es', 'items', catalogItems);
  await storeCatalog('es', 'sets', catalogSets);
  clearCatalogMemoryForTests();
  let persistedCatalogForwards = 0;
  const persistedCache = new InMemoryCache();
  const persistedClient = new ApolloClient({
    cache: persistedCache,
    link: ApolloLink.from([
      createCatalogLink('es', persistedCache),
      new ApolloLink(
        () =>
          new Observable((observer) => {
            persistedCatalogForwards += 1;
            observer.error(new Error('The persisted catalog reached the network'));
          }),
      ),
    ]),
  });
  const persistedItems = await persistedClient.query({
    query: ITEMS_QUERY,
    variables: itemVariables,
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(persistedItems.data.items.edges.length, 2);
  const persistedSet = await persistedClient.query({
    query: SET_QUERY,
    variables: { id: 'set-1' },
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(persistedSet.data.setById.id, 'set-1');
  assert.strictEqual(
    persistedCatalogForwards,
    0,
    'a recreated client reads both catalogs from IndexedDB without forwarding',
  );

  const typelessItems = withoutTypenames(catalogItems) as CatalogItem[];
  const typelessSets = withoutTypenames(catalogSets) as CatalogSet[];
  await storeCatalogBundle(
    'typeless',
    'test-revision',
    typelessItems,
    typelessSets,
  );
  clearCatalogMemoryForTests();
  const typelessCache = new InMemoryCache();
  const typelessClient = new ApolloClient({
    cache: typelessCache,
    link: ApolloLink.from([
      createCatalogLink('typeless', typelessCache),
      new ApolloLink(() => new Observable((observer) => {
        observer.error(new Error('The typeless catalog reached the network'));
      })),
    ]),
  });
  const typelessResult = await typelessClient.query({
    query: ITEMS_QUERY,
    variables: {
      ...itemVariables,
      filters: { ...itemVariables.filters, itemTypeIds: ['type-1'] },
    },
    fetchPolicy: 'network-only',
  });
  assert.deepStrictEqual(
    typelessResult.data.items.edges.map(
      (edge: { node: CatalogItem }) => edge.node.id,
    ),
    ['item-1', 'item-2'],
    'bootstrap payloads without typenames remain searchable',
  );

  const itemKeys = Object.keys(cache.extract()).filter((key) => key === 'Item:item-1');
  assert.strictEqual(itemKeys.length, 1, 'Apollo stores one normalized item identity');
  assert.ok(
    cache.readFragment({
      id: 'Item:item-1',
      fragment: gql`fragment cachedItem on Item { id name level itemType { id } }`,
    }),
    'the locally returned item is available to optimistic mutation code',
  );

  const staleItems = [item('item-stale', 'Stale Item', 100)];
  const staleSets: CatalogSet[] = [{
    __typename: 'Set', id: 'set-stale', name: 'Stale Set',
    searchNames: ['Stale Set'],
    items: staleItems, bonuses: [],
  }];
  const freshItems = [item('item-fresh', 'Fresh Item', 200)];
  const freshSets: CatalogSet[] = [{
    __typename: 'Set', id: 'set-fresh', name: 'Fresh Set',
    searchNames: ['Fresh Set'],
    items: freshItems, bonuses: [],
  }];
  await storeCatalogBundle('de', 'old-version', staleItems, staleSets);
  clearCatalogMemoryForTests();

  let resolveManifest: ((manifest: { schemaVersion: number; version: string }) => void) | undefined;
  const manifestPromise = new Promise<{ schemaVersion: number; version: string }>(
    (resolve) => { resolveManifest = resolve; },
  );
  let refreshForwards = 0;
  const refreshCache = new InMemoryCache();
  const refreshClient = new ApolloClient({
    cache: refreshCache,
    link: ApolloLink.from([
      createCatalogLink('de', refreshCache, {
        fetchManifest: () => manifestPromise,
      }),
      new ApolloLink(
        (operation) => new Observable((observer) => {
          refreshForwards += 1;
          const isItems = operation.operationName === 'catalogItems';
          const nodes = isItems ? freshItems : freshSets;
          observer.next({ data: {
            [isItems ? 'items' : 'sets']: {
              __typename: isItems ? 'ItemConnection' : 'SetConnection',
              edges: nodes.map((node, index) => ({ cursor: String(index), node })),
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          } });
          observer.complete();
        }),
      ),
    ]),
  });
  const staleResult = await refreshClient.query({
    query: ITEMS_QUERY,
    variables: itemVariables,
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(staleResult.data.items.edges[0].node.name, 'Stale Item');
  assert.strictEqual(refreshForwards, 0, 'stored results do not wait for freshness');

  resolveManifest?.({ schemaVersion: 2, version: 'new-version' });
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if ((await loadStoredCatalogBundle('de'))?.version === 'new-version') break;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.strictEqual(refreshForwards, 2, 'a mismatch fetches each complete catalog once');
  const freshResult = await refreshClient.query({
    query: ITEMS_QUERY,
    variables: itemVariables,
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(freshResult.data.items.edges[0].node.name, 'Fresh Item');
  const freshSet = await refreshClient.query({
    query: SET_QUERY,
    variables: { id: 'set-fresh' },
    fetchPolicy: 'network-only',
  });
  assert.strictEqual(freshSet.data.setById.name, 'Fresh Set');
  assert.strictEqual(refreshForwards, 2, 'the atomically switched bundle stays local');

  let incompleteForwards = 0;
  const incompleteCache = new InMemoryCache();
  const incompleteClient = new ApolloClient({
    cache: incompleteCache,
    link: ApolloLink.from([
      createCatalogLink('it', incompleteCache, {
        fetchManifest: async () => ({ schemaVersion: 2, version: 'first-version' }),
      }),
      new ApolloLink((operation) => new Observable((observer) => {
        incompleteForwards += 1;
        const isItems = ['items', 'catalogItems'].includes(operation.operationName);
        const nodes = isItems ? catalogItems : catalogSets;
        observer.next({ data: {
          [isItems ? 'items' : 'sets']: {
            edges: nodes.map((node, index) => ({ cursor: String(index), node })),
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        } });
        observer.complete();
      })),
    ]),
  });
  await incompleteClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if ((await loadStoredCatalogBundle('it'))?.version === 'first-version') break;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.strictEqual(
    incompleteForwards,
    2,
    'first use downloads each revision-proven catalog kind exactly once',
  );
  clearCatalogMemoryForTests();
  const firstBundle = await loadStoredCatalogBundle('it');
  assert.strictEqual(firstBundle?.version, 'first-version');
  assert.strictEqual(firstBundle?.items[0].name, 'Alpha');
  assert.strictEqual(firstBundle?.sets[0].name, 'Alpha Set');

  const crossingOldItems = [item('item-crossing-old', 'Crossing Old Item', 100)];
  const crossingOldSets: CatalogSet[] = [{
    __typename: 'Set', id: 'set-crossing-old', name: 'Crossing Old Set',
    searchNames: ['Crossing Old Set'], items: crossingOldItems, bonuses: [],
  }];
  const discardedItems = [item('item-discarded', 'Discarded Item', 150)];
  const crossingFreshItems = [item('item-crossing-fresh', 'Crossing Fresh Item', 200)];
  const crossingFreshSets: CatalogSet[] = [{
    __typename: 'Set', id: 'set-crossing-fresh', name: 'Crossing Fresh Set',
    searchNames: ['Crossing Fresh Set'], items: crossingFreshItems, bonuses: [],
  }];
  await storeCatalogBundle('pt', 'crossing-old', crossingOldItems, crossingOldSets);
  clearCatalogMemoryForTests();
  const crossingManifestVersions = [
    'revision-1',
    'revision-1', 'revision-2',
    'revision-2', 'revision-2',
    'revision-2', 'revision-2',
    'revision-2',
    'revision-2', 'revision-2',
  ];
  let crossingManifestReads = 0;
  let crossingForwards = 0;
  let crossingItemForwards = 0;
  const crossingCache = new InMemoryCache();
  const crossingClient = new ApolloClient({
    cache: crossingCache,
    link: ApolloLink.from([
      createCatalogLink('pt', crossingCache, {
        fetchManifest: async () => ({
          schemaVersion: 2,
          version: crossingManifestVersions[crossingManifestReads++],
        }),
      }),
      new ApolloLink((operation) => new Observable((observer) => {
        crossingForwards += 1;
        const isItems = operation.operationName === 'catalogItems';
        const nodes = isItems && crossingItemForwards++ === 0
          ? discardedItems
          : (isItems ? crossingFreshItems : crossingFreshSets);
        observer.next({ data: {
          [isItems ? 'items' : 'sets']: {
            edges: nodes.map((node, index) => ({ cursor: String(index), node })),
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        } });
        observer.complete();
      })),
    ]),
  });
  const crossingStaleResult = await crossingClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  assert.strictEqual(crossingStaleResult.data.items.edges[0].node.name, 'Crossing Old Item');
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if ((await loadStoredCatalogBundle('pt'))?.version === 'revision-2') break;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const crossingBundle = await loadStoredCatalogBundle('pt');
  assert.strictEqual(crossingForwards, 3, 'only the kind crossing revisions is downloaded twice');
  assert.strictEqual(crossingManifestReads, 10, 'each downloaded kind is enclosed by manifest reads');
  assert.strictEqual(crossingBundle?.version, 'revision-2');
  assert.strictEqual(crossingBundle?.items[0].name, 'Crossing Fresh Item');
  assert.strictEqual(crossingBundle?.sets[0].name, 'Crossing Fresh Set');
  assert.deepStrictEqual(
    (await storedKeysForLocale('pt')).sort(),
    ['2:pt:active', '2:pt:items:revision-2', '2:pt:sets:revision-2'],
    'only the proven revision is activated and retained',
  );

  const retryOldItems = [item('item-retry-old', 'Retry Old Item', 100)];
  const retryOldSets: CatalogSet[] = [{
    __typename: 'Set', id: 'set-retry-old', name: 'Retry Old Set',
    searchNames: ['Retry Old Set'], items: retryOldItems, bonuses: [],
  }];
  await storeCatalogBundle('nl', 'retry-old', retryOldItems, retryOldSets);
  clearCatalogMemoryForTests();
  let retryManifestReads = 0;
  let retryForwards = 0;
  const retryCache = new InMemoryCache();
  const retryClient = new ApolloClient({
    cache: retryCache,
    link: ApolloLink.from([
      createCatalogLink('nl', retryCache, {
        fetchManifest: async () => ({
          schemaVersion: 2,
          version: `moving-${++retryManifestReads}`,
        }),
      }),
      new ApolloLink((operation) => new Observable((observer) => {
        retryForwards += 1;
        const isItems = operation.operationName === 'catalogItems';
        const nodes = isItems ? crossingFreshItems : crossingFreshSets;
        observer.next({ data: {
          [isItems ? 'items' : 'sets']: {
            edges: nodes.map((node, index) => ({ cursor: String(index), node })),
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        } });
        observer.complete();
      })),
    ]),
  });
  const retryStaleResult = await retryClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  assert.strictEqual(retryStaleResult.data.items.edges[0].node.name, 'Retry Old Item');
  for (let attempt = 0; retryManifestReads < 7 && attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(retryManifestReads, 7, 'refresh retries are bounded at three attempts');
  assert.strictEqual(retryForwards, 3, 'a failing kind does not trigger an unnecessary second kind');
  clearCatalogMemoryForTests();
  const retryBundle = await loadStoredCatalogBundle('nl');
  assert.strictEqual(retryBundle?.version, 'retry-old');
  assert.strictEqual(retryBundle?.items[0].name, 'Retry Old Item');

  await storeCatalogBundle('ja', 'ttl-current', catalogItems, catalogSets);
  clearCatalogMemoryForTests();
  let clock = 1000;
  let ttlManifestReads = 0;
  const ttlCache = new InMemoryCache();
  const ttlClient = new ApolloClient({
    cache: ttlCache,
    link: ApolloLink.from([
      createCatalogLink('ja', ttlCache, {
        fetchManifest: async () => {
          ttlManifestReads += 1;
          return { schemaVersion: 2, version: 'ttl-current' };
        },
        manifestTtlMs: 100,
        now: () => clock,
      }),
      new ApolloLink(() => new Observable((observer) => {
        observer.error(new Error('a current TTL catalog reached the network'));
      })),
    ]),
  });
  await ttlClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  for (let attempt = 0; ttlManifestReads < 1 && attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.strictEqual(ttlManifestReads, 1);
  clock += 50;
  await ttlClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(ttlManifestReads, 1, 'successful checks are throttled within the TTL');
  clock += 51;
  await ttlClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  for (let attempt = 0; ttlManifestReads < 2 && attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.strictEqual(ttlManifestReads, 2, 'long-lived tabs recheck after the TTL');

  let incompatibleForwards = 0;
  const incompatibleCache = new InMemoryCache();
  const incompatibleClient = new ApolloClient({
    cache: incompatibleCache,
    link: ApolloLink.from([
      createCatalogLink('nl', incompatibleCache, {
        fetchManifest: async () => ({ schemaVersion: 999, version: 'unknown-shape' }),
      }),
      new ApolloLink(() => new Observable((observer) => {
        incompatibleForwards += 1;
        observer.error(new Error('incompatible manifest must not refresh'));
      })),
    ]),
  });
  const incompatibleResult = await incompatibleClient.query({
    query: ITEMS_QUERY, variables: itemVariables, fetchPolicy: 'network-only',
  });
  assert.strictEqual(incompatibleResult.data.items.edges[0].node.name, 'Retry Old Item');
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.strictEqual(incompatibleForwards, 0, 'schema mismatch retains known-good data safely');
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
