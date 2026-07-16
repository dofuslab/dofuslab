import {
  ApolloLink,
  FetchResult,
  gql,
  InMemoryCache,
  NextLink,
  Observable,
  Operation,
} from '@apollo/client';

import {
  CatalogItem,
  CatalogSet,
  CATALOG_SCHEMA_VERSION,
  getSet,
  loadStoredCatalogSnapshot,
  loadStoredCatalogBundle,
  searchItems,
  searchSets,
  storeCatalogBundle,
  storePendingCatalog,
} from './index';

// Keep each enriched GraphQL response comfortably below common reverse-proxy
// timeouts while still amortizing pagination overhead across the full catalog.
const BOOTSTRAP_PAGE_SIZE = 500;
const MAX_CATALOG_REFRESH_ATTEMPTS = 3;
const DEFAULT_MANIFEST_TTL_MS = 5 * 60 * 1000;

const CACHED_ITEM_FRAGMENT = gql`
  fragment offlineCatalogItem on Item {
    id
    name
    searchNames
    level
    imageUrl
    conditions
    stats { id order minValue maxValue stat customStat }
    weaponStats {
      id
      apCost
      usesPerTurn
      minRange
      maxRange
      baseCritChance
      critBonusDamage
      weaponEffects { id minDamage maxDamage effectType }
    }
    itemType {
      id
      name
      enName
      eligibleItemSlots { id enName order }
    }
    set { id name searchNames bonuses { id numItems stat value customStat } }
    buffs { id stat incrementBy critIncrementBy maxStacks }
  }
`;

const CACHED_SET_FRAGMENT = gql`
  fragment offlineCatalogSet on Set {
    id
    name
    searchNames
    bonuses { id numItems stat value customStat }
    items { ...offlineCatalogItem }
  }
  ${CACHED_ITEM_FRAGMENT}
`;

// A standalone document is required when setById is the first catalog
// operation in a session: forwarding that operation with pagination variables
// would only fetch one set, not the complete searchable catalog.
const SETS_BOOTSTRAP_QUERY = gql`
  query catalogSets($first: Int!, $after: String, $filters: SetFilters!) {
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
            weaponStats {
              id
              apCost
              usesPerTurn
              minRange
              maxRange
              baseCritChance
              critBonusDamage
              weaponEffects { id minDamage maxDamage effectType }
            }
            itemType {
              id
              name
              enName
              eligibleItemSlots { id enName order }
            }
            set {
              id
              name
              searchNames
              bonuses { id numItems stat value customStat }
            }
            buffs { id stat incrementBy critIncrementBy maxStacks }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const ITEMS_BOOTSTRAP_QUERY = gql`
  query catalogItems($first: Int!, $after: String, $filters: ItemFilters!) {
    items(first: $first, after: $after, filters: $filters) {
      edges { cursor node { ...offlineCatalogItem } }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${CACHED_ITEM_FRAGMENT}
`;

const itemCatalogPromises = new Map<string, Promise<CatalogItem[]>>();
const setCatalogPromises = new Map<string, Promise<CatalogSet[]>>();
type RevalidationResult = 'checked' | 'failed';

export type CatalogManifest = {
  schemaVersion: number;
  version: string;
};

export type CatalogLinkOptions = {
  fetchManifest?: () => Promise<CatalogManifest>;
  manifestTtlMs?: number;
  now?: () => number;
};

type CatalogQueryData<T> = {
  items?: { edges: Array<{ node: T }>; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  sets?: { edges: Array<{ node: T }>; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
};

function isSupportedManifest(
  manifest: CatalogManifest,
): manifest is CatalogManifest {
  return (
    manifest?.schemaVersion === CATALOG_SCHEMA_VERSION &&
    typeof manifest.version === 'string' &&
    manifest.version.trim().length > 0
  );
}

function withItemTypenames(node: CatalogItem): CatalogItem {
  return {
    ...node,
    __typename: 'Item',
    stats: node.stats.map((stat) => ({ ...stat, __typename: 'ItemStat' })),
    weaponStats: node.weaponStats
      ? {
          ...node.weaponStats,
          __typename: 'WeaponStat',
          weaponEffects: node.weaponStats.weaponEffects.map((effect) => ({
            ...effect,
            __typename: 'WeaponEffect',
          })),
        }
      : null,
    itemType: {
      ...node.itemType,
      __typename: 'ItemType',
      eligibleItemSlots: node.itemType.eligibleItemSlots.map((slot) => ({
        ...slot,
        __typename: 'ItemSlot',
      })),
    },
    set: node.set
      ? {
          ...node.set,
          __typename: 'Set',
          bonuses: node.set.bonuses.map((bonus) => ({
            ...bonus,
            __typename: 'SetBonus',
          })),
        }
      : null,
    buffs: node.buffs?.map((buff) => ({ ...buff, __typename: 'Buff' })) ?? null,
  };
}

function withSetTypenames(node: CatalogSet): CatalogSet {
  return {
    ...node,
    __typename: 'Set',
    bonuses: node.bonuses.map((bonus) => ({
      ...bonus,
      __typename: 'SetBonus',
    })),
    items: node.items.map(withItemTypenames),
  };
}

function isCompleteCatalogItem(item: CatalogItem | null): item is CatalogItem {
  return Boolean(
    item?.itemType &&
      Array.isArray(item.itemType.eligibleItemSlots) &&
      Array.isArray(item.stats) &&
      Array.isArray(item.buffs),
  );
}

function isCompleteCatalogSet(set: CatalogSet | null): set is CatalogSet {
  return Boolean(
    set &&
      Array.isArray(set.items) &&
      set.items.every(isCompleteCatalogItem) &&
      Array.isArray(set.bonuses),
  );
}

function reconcileItem(cache: InMemoryCache, node: CatalogItem): CatalogItem {
  const id = cache.identify(node);
  if (!id) return node;
  try {
    const cached = cache.readFragment<CatalogItem>({
      id,
      fragment: CACHED_ITEM_FRAGMENT,
    });
    return isCompleteCatalogItem(cached) ? cached : node;
  } catch {
    // Other operations may have normalized a partial Item by UUID. Until it
    // contains every catalog field, the complete bootstrap snapshot wins.
    return node;
  }
}

function reconcileSet(cache: InMemoryCache, node: CatalogSet): CatalogSet {
  const id = cache.identify(node);
  if (!id) {
    return { ...node, items: node.items.map((item) => reconcileItem(cache, item)) };
  }
  let cached: CatalogSet | null = null;
  try {
    cached = cache.readFragment<CatalogSet>({
      id,
      fragment: CACHED_SET_FRAGMENT,
      fragmentName: 'offlineCatalogSet',
    });
  } catch {
    // Item results normalize their containing set by UUID before the complete
    // set catalog is present. Apollo 3.2 throws on that partial fragment.
  }
  if (isCompleteCatalogSet(cached)) return cached;
  return { ...node, items: node.items.map((item) => reconcileItem(cache, item)) };
}

function cloneOperation(
  operation: Operation,
  variables: Record<string, unknown>,
  query = operation.query,
  operationName = operation.operationName,
): Operation {
  return {
    query,
    operationName,
    variables,
    extensions: operation.extensions,
    getContext: operation.getContext.bind(operation),
    setContext: operation.setContext.bind(operation),
  };
}

function forwardOnce(
  forward: NextLink,
  operation: Operation,
): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    let result: FetchResult | undefined;
    forward(operation).subscribe({
      next: (nextResult) => {
        result = nextResult;
      },
      error: reject,
      complete: () => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Catalog bootstrap returned no result'));
        }
      },
    });
  });
}

function assertBootstrapResult(result: FetchResult): void {
  const errors = (result as FetchResult & {
    errors?: ReadonlyArray<{ message: string }>;
  }).errors;
  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join('\n'));
  }
  if (!result.data) {
    throw new Error('Catalog bootstrap returned no data');
  }
}

async function loadItems(
  locale: string,
  operation: Operation,
  forward: NextLink,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<CatalogItem[]> {
  const existing = itemCatalogPromises.get(locale);
  if (existing) return existing;

  const promise = (async () => {
    const stored = await loadStoredCatalogSnapshot(locale, 'items');
    if (stored) return stored.nodes.map(withItemTypenames);
    const nodes = await fetchProvenKind(
      locale,
      'items',
      operation,
      forward,
      fetchManifest,
    );
    return nodes.map(withItemTypenames);
  })();

  itemCatalogPromises.set(locale, promise);
  try {
    return await promise;
  } catch (error) {
    itemCatalogPromises.delete(locale);
    throw error;
  }
}

async function fetchAllItems(
  operation: Operation,
  forward: NextLink,
): Promise<CatalogItem[]> {
  const nodes: CatalogItem[] = [];
  let after: string | null = null;
  let hasNextPage = false;
  do {
    const bootstrapOperation = cloneOperation(
      operation,
      {
        first: BOOTSTRAP_PAGE_SIZE,
        after,
        filters: { stats: [], maxLevel: 10000, search: '', itemTypeIds: [] },
      },
      ITEMS_BOOTSTRAP_QUERY,
      'catalogItems',
    );
    const result = await forwardOnce(forward, bootstrapOperation);
    assertBootstrapResult(result);
    const data = result.data as unknown as CatalogQueryData<CatalogItem>;
    if (!data.items) throw new Error('Item catalog bootstrap returned no items');
    nodes.push(...data.items.edges.map((edge) => edge.node));
    hasNextPage = data.items.pageInfo.hasNextPage;
    after = data.items.pageInfo.endCursor;
    if (hasNextPage && !after) {
      throw new Error('Item catalog bootstrap returned no continuation cursor');
    }
  } while (hasNextPage);
  return nodes;
}

async function fetchAllSets(
  operation: Operation,
  forward: NextLink,
): Promise<CatalogSet[]> {
  const nodes: CatalogSet[] = [];
  let after: string | null = null;
  let hasNextPage = false;
  do {
    const bootstrapOperation = cloneOperation(
      operation,
      {
        first: BOOTSTRAP_PAGE_SIZE,
        after,
        filters: {
          stats: [], maxLevel: 10000, search: '', itemTypeIdGroups: [],
        },
      },
      SETS_BOOTSTRAP_QUERY,
      'catalogSets',
    );
    const result = await forwardOnce(forward, bootstrapOperation);
    assertBootstrapResult(result);
    const data = result.data as unknown as CatalogQueryData<CatalogSet>;
    if (!data.sets) throw new Error('Set catalog bootstrap returned no sets');
    nodes.push(...data.sets.edges.map((edge) => edge.node));
    hasNextPage = data.sets.pageInfo.hasNextPage;
    after = data.sets.pageInfo.endCursor;
    if (hasNextPage && !after) {
      throw new Error('Set catalog bootstrap returned no continuation cursor');
    }
  } while (hasNextPage);
  return nodes;
}

async function fetchProvenKind(
  locale: string,
  kind: 'items',
  operation: Operation,
  forward: NextLink,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<CatalogItem[]>;
async function fetchProvenKind(
  locale: string,
  kind: 'sets',
  operation: Operation,
  forward: NextLink,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<CatalogSet[]>;
async function fetchProvenKind(
  locale: string,
  kind: 'items' | 'sets',
  operation: Operation,
  forward: NextLink,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<CatalogItem[] | CatalogSet[]> {
  for (let attempt = 0; attempt < MAX_CATALOG_REFRESH_ATTEMPTS; attempt += 1) {
    const before = await fetchManifest();
    if (!isSupportedManifest(before)) {
      throw new Error('Catalog manifest schema is unsupported');
    }
    const nodes = kind === 'items'
      ? await fetchAllItems(operation, forward)
      : await fetchAllSets(operation, forward);
    const after = await fetchManifest();
    if (!isSupportedManifest(after)) {
      throw new Error('Catalog manifest schema is unsupported');
    }
    if (before.version !== after.version) continue;
    if (kind === 'items') {
      await storePendingCatalog(locale, kind, after.version, nodes as CatalogItem[]);
    } else {
      await storePendingCatalog(locale, kind, after.version, nodes as CatalogSet[]);
    }
    return nodes;
  }
  throw new Error('Catalog changed repeatedly during bootstrap');
}

export function deriveCatalogManifestUrl(graphqlUrl: string): string {
  const trimmed = graphqlUrl.trim();
  const matched = trimmed.match(/^(.*)\/api\/graphql\/?(?:[?#].*)?$/);
  if (matched) return `${matched[1]}/api/catalog/manifest.json`;
  try {
    const url = new URL(trimmed);
    url.pathname = '/api/catalog/manifest.json';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '/api/catalog/manifest.json';
  }
}

function defaultManifestUrl(): string {
  return deriveCatalogManifestUrl(
    process.env.NEXT_PUBLIC_GRAPHQL_URI ?? '/api/graphql',
  );
}

async function fetchDefaultManifest(): Promise<CatalogManifest> {
  const response = await fetch(defaultManifestUrl(), {
    cache: 'no-cache',
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`Catalog manifest returned ${response.status}`);
  return response.json() as Promise<CatalogManifest>;
}

function revalidateCatalog(
  locale: string,
  operation: Operation,
  forward: NextLink,
  cache: InMemoryCache,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<RevalidationResult> {
  return (async () => {
    const stored = await loadStoredCatalogBundle(locale);
    const currentManifest = await fetchManifest();
    if (!isSupportedManifest(currentManifest)) return 'checked' as const;
    if (stored?.version === currentManifest.version) return 'checked' as const;

    // Reuse a proven per-kind snapshot when possible. This is what prevents the
    // first operation's catalog from being downloaded again while the other
    // kind is completed in the background.
    for (let attempt = 0; attempt < MAX_CATALOG_REFRESH_ATTEMPTS; attempt += 1) {
      const before = attempt === 0 ? currentManifest : await fetchManifest();
      if (!isSupportedManifest(before)) return 'checked' as const;
      const [itemSnapshot, setSnapshot] = await Promise.all([
        loadStoredCatalogSnapshot(locale, 'items', before.version),
        loadStoredCatalogSnapshot(locale, 'sets', before.version),
      ]);
      const items = (itemSnapshot?.version === before.version
        ? itemSnapshot.nodes
        : await fetchProvenKind(locale, 'items', operation, forward, fetchManifest))
        .map(withItemTypenames);
      const sets = (setSnapshot?.version === before.version
        ? setSnapshot.nodes
        : await fetchProvenKind(locale, 'sets', operation, forward, fetchManifest))
        .map(withSetTypenames);
      const after = await fetchManifest();
      if (!isSupportedManifest(after)) return 'checked' as const;
      if (before.version !== after.version) continue;

      const [provenItems, provenSets] = await Promise.all([
        loadStoredCatalogSnapshot(locale, 'items', after.version),
        loadStoredCatalogSnapshot(locale, 'sets', after.version),
      ]);
      if (
        provenItems?.version !== after.version ||
        provenSets?.version !== after.version
      ) continue;

      await storeCatalogBundle(locale, after.version, items, sets);
      // Mounted cache-and-network selectors refresh their own connections
      // through this link. Keep those roots intact so bundle activation cannot
      // blank a selector between its local result and the background refresh.
      items.forEach((item) => {
        cache.writeFragment({
          id: cache.identify(item),
          fragment: CACHED_ITEM_FRAGMENT,
          data: item,
        });
      });
      sets.forEach((set) => {
        cache.writeFragment({
          id: cache.identify(set),
          fragment: CACHED_SET_FRAGMENT,
          fragmentName: 'offlineCatalogSet',
          data: set,
        });
      });
      itemCatalogPromises.set(locale, Promise.resolve(items));
      setCatalogPromises.set(locale, Promise.resolve(sets));
      return 'checked' as const;
    }
    return 'failed' as const;
  })().catch(() => {
    // Offline and server failures leave the known-good active bundle untouched.
    return 'failed' as const;
  });
}

async function loadSets(
  locale: string,
  operation: Operation,
  forward: NextLink,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<CatalogSet[]> {
  const existing = setCatalogPromises.get(locale);
  if (existing) return existing;

  const promise = (async () => {
    const stored = await loadStoredCatalogSnapshot(locale, 'sets');
    if (stored) return stored.nodes.map(withSetTypenames);
    const nodes = await fetchProvenKind(
      locale,
      'sets',
      operation,
      forward,
      fetchManifest,
    );
    return nodes.map(withSetTypenames);
  })();

  setCatalogPromises.set(locale, promise);
  try {
    return await promise;
  } catch (error) {
    setCatalogPromises.delete(locale);
    throw error;
  }
}

async function executeLocally(
  locale: string,
  operation: Operation,
  forward: NextLink,
  cache: InMemoryCache,
  fetchManifest: () => Promise<CatalogManifest>,
): Promise<FetchResult> {
  if (operation.operationName === 'items') {
    const storedNodes = await loadItems(locale, operation, forward, fetchManifest);
    const nodes = storedNodes.map((node) => reconcileItem(cache, node));
    const { first, after, filters } = operation.variables;
    const connection = searchItems(nodes, filters, first, after, locale);
    return {
      data: {
        items: { __typename: 'ItemConnection', ...connection },
      },
    };
  }

  if (operation.operationName === 'sets') {
    const storedNodes = await loadSets(locale, operation, forward, fetchManifest);
    const nodes = storedNodes.map((node) => reconcileSet(cache, node));
    const { first, after, filters } = operation.variables;
    const connection = searchSets(nodes, filters, first, after, locale);
    return {
      data: {
        sets: { __typename: 'SetConnection', ...connection },
      },
    };
  }

  const storedNodes = await loadSets(locale, operation, forward, fetchManifest);
  const nodes = storedNodes.map((node) => reconcileSet(cache, node));
  const set = getSet(nodes, String(operation.variables.id));
  return { data: { setById: set ?? null } };
}

/**
 * Serves static item/set reads from a persistent browser catalog while leaving
 * every user-owned or dynamic operation on the normal HTTP link.
 */
export function createCatalogLink(
  locale: string,
  cache: InMemoryCache,
  options: CatalogLinkOptions = {},
): ApolloLink {
  const fetchManifest = options.fetchManifest ?? fetchDefaultManifest;
  const now = options.now ?? Date.now;
  const manifestTtlMs = options.manifestTtlMs ?? DEFAULT_MANIFEST_TTL_MS;
  let lastSuccessfulCheckAt: number | undefined;
  let revalidationPromise: Promise<RevalidationResult> | undefined;

  const scheduleRevalidation = (
    operation: Operation,
    forward: NextLink,
  ): void => {
    if (revalidationPromise) return;
    if (
      lastSuccessfulCheckAt !== undefined &&
      now() - lastSuccessfulCheckAt < manifestTtlMs
    ) return;
    revalidationPromise = revalidateCatalog(
      locale,
      operation,
      forward,
      cache,
      fetchManifest,
    );
    void revalidationPromise.then((result) => {
      if (result === 'checked') lastSuccessfulCheckAt = now();
      revalidationPromise = undefined;
    });
  };

  return new ApolloLink((operation, forward) => {
    if (
      process.env.NEXT_PUBLIC_CLIENT_CATALOG_ENABLED === 'false' ||
      !['items', 'sets', 'set'].includes(operation.operationName)
    ) {
      return forward(operation);
    }

    return new Observable((observer) => {
      let cancelled = false;
      let fallbackSubscription: { unsubscribe: () => void } | undefined;
      executeLocally(locale, operation, forward, cache, fetchManifest)
        .then((result) => {
          if (cancelled) return;
          observer.next(result);
          observer.complete();
          scheduleRevalidation(operation, forward);
        })
        .catch(() => {
          if (cancelled) return;

          // IndexedDB and its manifest are an optimization. A missing route,
          // unsupported browser, or interrupted refresh must never make the
          // normal online catalog unavailable.
          fallbackSubscription = forward(operation).subscribe({
            next: (result) => observer.next(result),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });
        });
      return () => {
        cancelled = true;
        fallbackSubscription?.unsubscribe();
      };
    });
  });
}
