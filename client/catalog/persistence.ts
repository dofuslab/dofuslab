import { CatalogKind, CatalogNodesByKind } from './types';

export const CATALOG_SCHEMA_VERSION = 2;

const DATABASE_NAME = 'dofuslab-local-catalog';
const STORE_NAME = 'catalogs';
const memoryCatalogs = new Map<string, unknown[]>();
const memoryVersions = new Map<string, string>();
const memoryPendingCatalogs = new Map<string, { version: string; nodes: unknown[] }>();

/** Test helper that simulates a new JavaScript session without clearing IDB. */
export function clearCatalogMemoryForTests(): void {
  memoryCatalogs.clear();
  memoryVersions.clear();
  memoryPendingCatalogs.clear();
}

type CatalogRecord<K extends CatalogKind = CatalogKind> = {
  key: string;
  kind: K;
  locale: string;
  version: number;
  schemaVersion: number;
  updatedAt: string;
  nodes: CatalogNodesByKind[K];
};

function catalogKey(locale: string, kind: CatalogKind): string {
  return `${CATALOG_SCHEMA_VERSION}:${locale}:${kind}`;
}

function versionedCatalogKey(
  locale: string,
  kind: CatalogKind,
  catalogVersion: string,
): string {
  return `${catalogKey(locale, kind)}:${catalogVersion}`;
}

function activeVersionKey(locale: string): string {
  return `${CATALOG_SCHEMA_VERSION}:${locale}:active`;
}

function pendingVersionKey(locale: string, kind: CatalogKind): string {
  return `${CATALOG_SCHEMA_VERSION}:${locale}:${kind}:pending`;
}

type ActiveVersionRecord = {
  key: string;
  catalogVersion: string;
};

type PendingVersionRecord = ActiveVersionRecord;

export type StoredCatalogSnapshot<K extends CatalogKind = CatalogKind> = {
  nodes: CatalogNodesByKind[K];
  version?: string;
  active: boolean;
};

/** Reads the active kind, then a revision-proven pending kind, then legacy data. */
export async function loadStoredCatalogSnapshot<K extends CatalogKind>(
  locale: string,
  kind: K,
  preferredVersion?: string,
): Promise<StoredCatalogSnapshot<K> | undefined> {
  const key = catalogKey(locale, kind);
  try {
    const active = await readByKey<ActiveVersionRecord>(activeVersionKey(locale));
    if (active) {
      const record = await readByKey<CatalogRecord<K>>(
        versionedCatalogKey(locale, kind, active.catalogVersion),
      );
      if (record && (!preferredVersion || active.catalogVersion === preferredVersion)) {
        memoryCatalogs.set(key, record.nodes);
        memoryVersions.set(locale, active.catalogVersion);
        return { nodes: record.nodes, version: active.catalogVersion, active: true };
      }
    }

    const pending = await readByKey<PendingVersionRecord>(pendingVersionKey(locale, kind));
    if (pending) {
      const record = await readByKey<CatalogRecord<K>>(
        versionedCatalogKey(locale, kind, pending.catalogVersion),
      );
      if (record && (!preferredVersion || pending.catalogVersion === preferredVersion)) {
        memoryPendingCatalogs.set(key, {
          version: pending.catalogVersion,
          nodes: record.nodes,
        });
        return { nodes: record.nodes, version: pending.catalogVersion, active: false };
      }
    }

    const record = await readRecord(locale, kind);
    if (
      record?.version === CATALOG_SCHEMA_VERSION &&
      record.schemaVersion === CATALOG_SCHEMA_VERSION
    ) {
      memoryCatalogs.set(key, record.nodes);
      return { nodes: record.nodes, active: false };
    }
  } catch {
    // SSR, private browsing, quota/security errors, and blocked upgrades use memory.
  }

  const pending = memoryPendingCatalogs.get(key);
  if (pending) {
    return {
      nodes: pending.nodes as CatalogNodesByKind[K],
      version: pending.version,
      active: false,
    };
  }
  const nodes = memoryCatalogs.get(key) as CatalogNodesByKind[K] | undefined;
  if (!nodes) return undefined;
  return { nodes, version: memoryVersions.get(locale), active: false };
}

function openCatalogDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }

    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DATABASE_NAME, CATALOG_SCHEMA_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB upgrade was blocked'));
  });
}

async function readRecord<K extends CatalogKind>(
  locale: string,
  kind: K,
): Promise<CatalogRecord<K> | undefined> {
  const database = await openCatalogDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(catalogKey(locale, kind));
      request.onsuccess = () => resolve(request.result as CatalogRecord<K> | undefined);
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function readByKey<T>(key: string): Promise<T | undefined> {
  const database = await openCatalogDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function writeRecord<K extends CatalogKind>(
  locale: string,
  kind: K,
  nodes: CatalogNodesByKind[K],
): Promise<void> {
  const database = await openCatalogDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const record: CatalogRecord<K> = {
        key: catalogKey(locale, kind),
        kind,
        locale,
        version: CATALOG_SCHEMA_VERSION,
        schemaVersion: CATALOG_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        nodes,
      };
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

/** Returns the cached GraphQL-shaped nodes, or undefined when no catalog exists. */
export async function loadStoredCatalog<K extends CatalogKind>(
  locale: string,
  kind: K,
): Promise<CatalogNodesByKind[K] | undefined> {
  return (await loadStoredCatalogSnapshot(locale, kind))?.nodes;
}

/** Persists a whole locale catalog atomically, falling back to process memory. */
export async function storeCatalog<K extends CatalogKind>(
  locale: string,
  kind: K,
  nodes: CatalogNodesByKind[K],
): Promise<void> {
  const key = catalogKey(locale, kind);
  memoryCatalogs.set(key, nodes);
  try {
    await writeRecord(locale, kind, nodes);
  } catch {
    // Keeping the memory copy makes catalog search usable when IndexedDB fails.
  }
}

/** Stores one catalog kind whose revision was proven by matching manifest reads. */
export async function storePendingCatalog<K extends CatalogKind>(
  locale: string,
  kind: K,
  catalogVersion: string,
  nodes: CatalogNodesByKind[K],
): Promise<void> {
  const key = catalogKey(locale, kind);
  memoryPendingCatalogs.set(key, { version: catalogVersion, nodes });
  try {
    const database = await openCatalogDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put({
          key: versionedCatalogKey(locale, kind, catalogVersion),
          kind,
          locale,
          version: CATALOG_SCHEMA_VERSION,
          schemaVersion: CATALOG_SCHEMA_VERSION,
          updatedAt: new Date().toISOString(),
          nodes,
        });
        store.put({
          key: pendingVersionKey(locale, kind),
          catalogVersion,
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  } catch {
    // The proven in-memory snapshot still prevents a duplicate session download.
  }
}

export type StoredCatalogBundle = {
  version?: string;
  items: CatalogNodesByKind['items'];
  sets: CatalogNodesByKind['sets'];
};

/** Reads only the active, complete bundle; a partially written version is invisible. */
export async function loadStoredCatalogBundle(
  locale: string,
): Promise<StoredCatalogBundle | undefined> {
  try {
    const active = await readByKey<ActiveVersionRecord>(activeVersionKey(locale));
    if (active) {
      const [items, sets] = await Promise.all([
        readByKey<CatalogRecord<'items'>>(
          versionedCatalogKey(locale, 'items', active.catalogVersion),
        ),
        readByKey<CatalogRecord<'sets'>>(
          versionedCatalogKey(locale, 'sets', active.catalogVersion),
        ),
      ]);
      if (items && sets) {
        memoryCatalogs.set(catalogKey(locale, 'items'), items.nodes);
        memoryCatalogs.set(catalogKey(locale, 'sets'), sets.nodes);
        memoryVersions.set(locale, active.catalogVersion);
        return {
          version: active.catalogVersion,
          items: items.nodes,
          sets: sets.nodes,
        };
      }
    }
  } catch {
    // Fall through to memory/legacy records when IndexedDB is unavailable.
  }

  const [items, sets] = await Promise.all([
    loadStoredCatalog(locale, 'items'),
    loadStoredCatalog(locale, 'sets'),
  ]);
  if (!items || !sets) return undefined;
  return { version: memoryVersions.get(locale), items, sets };
}

/**
 * Writes a complete version, then switches the active pointer. A failed write
 * leaves the previous active bundle readable.
 */
export async function storeCatalogBundle(
  locale: string,
  catalogVersion: string,
  items: CatalogNodesByKind['items'],
  sets: CatalogNodesByKind['sets'],
): Promise<void> {
  memoryCatalogs.set(catalogKey(locale, 'items'), items);
  memoryCatalogs.set(catalogKey(locale, 'sets'), sets);
  memoryVersions.set(locale, catalogVersion);
  memoryPendingCatalogs.delete(catalogKey(locale, 'items'));
  memoryPendingCatalogs.delete(catalogKey(locale, 'sets'));
  try {
    const database = await openCatalogDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const common = {
          locale,
          version: CATALOG_SCHEMA_VERSION,
          schemaVersion: CATALOG_SCHEMA_VERSION,
          updatedAt: new Date().toISOString(),
        };
        store.put({
          ...common,
          key: versionedCatalogKey(locale, 'items', catalogVersion),
          kind: 'items',
          nodes: items,
        });
        store.put({
          ...common,
          key: versionedCatalogKey(locale, 'sets', catalogVersion),
          kind: 'sets',
          nodes: sets,
        });
        // This is ordered after both puts and commits in the same IDB transaction.
        store.put({ key: activeVersionKey(locale), catalogVersion });
        const retainedKeys = new Set([
          versionedCatalogKey(locale, 'items', catalogVersion),
          versionedCatalogKey(locale, 'sets', catalogVersion),
          activeVersionKey(locale),
        ]);
        const localePrefix = `${CATALOG_SCHEMA_VERSION}:${locale}:`;
        const cursorRequest = store.openKeyCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) return;
          const key = String(cursor.primaryKey);
          if (key.startsWith(localePrefix) && !retainedKeys.has(key)) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  } catch {
    // The complete in-memory bundle remains active for this session.
  }
}
