import { StatFilter } from '../__generated__/globalTypes';
import {
  CatalogConnection,
  CatalogItem,
  CatalogItemFilters,
  CatalogSet,
  CatalogSetFilters,
} from './types';

const CURSOR_PREFIX = 'arrayconnection:';

function encodeCursor(offset: number): string {
  const value = `${CURSOR_PREFIX}${offset}`;
  if (typeof btoa === 'function') return btoa(value);
  return asciiToBase64(value);
}

function decodeCursor(cursor?: string | null): number {
  if (!cursor) return -1;
  try {
    const decoded = typeof atob === 'function' ? atob(cursor) : base64ToAscii(cursor);
    if (!decoded.startsWith(CURSOR_PREFIX)) return -1;
    const offset = Number(decoded.slice(CURSOR_PREFIX.length));
    return Number.isInteger(offset) && offset >= 0 ? offset : -1;
  } catch {
    return -1;
  }
}

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function asciiToBase64(value: string): string {
  let result = '';
  for (let index = 0; index < value.length; index += 3) {
    const first = value.charCodeAt(index);
    const hasSecond = index + 1 < value.length;
    const hasThird = index + 2 < value.length;
    const second = hasSecond ? value.charCodeAt(index + 1) : 0;
    const third = hasThird ? value.charCodeAt(index + 2) : 0;
    const bits = (first << 16) | (second << 8) | third;
    result += BASE64_ALPHABET[(bits >> 18) & 63];
    result += BASE64_ALPHABET[(bits >> 12) & 63];
    result += hasSecond ? BASE64_ALPHABET[(bits >> 6) & 63] : '=';
    result += hasThird ? BASE64_ALPHABET[bits & 63] : '=';
  }
  return result;
}

function base64ToAscii(value: string): string {
  let result = '';
  const normalized = value.replace(/=+$/, '');
  let bits = 0;
  let bitCount = 0;
  for (const character of normalized) {
    const sextet = BASE64_ALPHABET.indexOf(character);
    if (sextet < 0) throw new Error('Invalid cursor');
    bits = (bits << 6) | sextet;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      result += String.fromCharCode((bits >> bitCount) & 255);
    }
  }
  return result;
}

function inRange(value: number | null | undefined, filter: StatFilter): boolean {
  if (value == null) return false;
  return (
    (filter.minValue == null || value >= filter.minValue) &&
    (filter.maxValue == null || value <= filter.maxValue)
  );
}

function paginate<T>(
  nodes: T[],
  first: number,
  after: string | null | undefined,
  edgeTypename: 'ItemEdge' | 'SetEdge',
): CatalogConnection<T> {
  const start = Math.max(0, decodeCursor(after) + 1);
  const count = Math.max(0, first);
  const page = nodes.slice(start, start + count);
  const edges = page.map((node, index) => ({
    __typename: edgeTypename,
    cursor: encodeCursor(start + index),
    node,
  }));
  return {
    edges,
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: start + page.length < nodes.length,
      endCursor: edges.length ? edges[edges.length - 1].cursor : null,
    },
  };
}

function compareNames(left: string, right: string, locale: string): number {
  return left.localeCompare(right, locale, { sensitivity: 'variant' });
}

function contains(haystack: string | null | undefined, needle: string): boolean {
  return Boolean(haystack?.toLocaleUpperCase().includes(needle.toLocaleUpperCase()));
}

function containsName(
  displayName: string,
  searchNames: readonly string[] | undefined,
  needle: string,
): boolean {
  // Keep catalogs written by the first prototype searchable after an upgrade.
  return (
    contains(displayName, needle) ||
    Boolean(searchNames?.some((name) => contains(name, needle)))
  );
}

function itemMatchesStats(item: CatalogItem, filters: StatFilter[]): boolean {
  if (!filters.length) return true;

  // Match either endpoint, mirroring the SQL resolver. Older stored prototype
  // catalogs may omit minValue, in which case maxValue still participates.
  const matchingRows = item.stats.filter((itemStat) =>
    filters.some(
      (filter) =>
        itemStat.stat === filter.stat &&
        (inRange(itemStat.maxValue, filter) || inRange(itemStat.minValue, filter)),
    ),
  );
  return matchingRows.length === filters.length;
}

function setMatchesStats(set: CatalogSet, filters: StatFilter[]): boolean {
  if (!filters.length) return true;
  const matchingStats = new Set(
    set.bonuses
      .filter((bonus) =>
        filters.some(
          (filter) => bonus.stat === filter.stat && inRange(bonus.value, filter),
        ),
      )
      .map((bonus) => bonus.stat)
      .filter((stat): stat is NonNullable<typeof stat> => stat != null),
  );
  return matchingStats.size === filters.length;
}

function setLevel(set: CatalogSet): number {
  return set.items.reduce((level, item) => Math.max(level, item.level), -1);
}

function setMatchesItemTypeGroups(
  set: CatalogSet,
  groups: CatalogSetFilters['itemTypeIdGroups'],
): boolean {
  if (!groups.length) return true;
  const matchedGroups = new Set<number>();
  for (const item of set.items) {
    // SQL CASE selects the first matching group when groups overlap.
    const group = groups.findIndex((ids) => ids.includes(item.itemType.id));
    if (group >= 0) matchedGroups.add(group);
  }
  return matchedGroups.size === groups.length;
}

export function searchItems(
  nodes: CatalogItem[],
  filters: CatalogItemFilters,
  first: number,
  after?: string | null,
  locale = 'en',
): CatalogConnection<CatalogItem> {
  const search = filters.search.trim();
  const filtered = nodes.filter(
    (item) =>
      item.level <= filters.maxLevel &&
      (!filters.itemTypeIds.length || filters.itemTypeIds.includes(item.itemType.id)) &&
      (!search ||
        containsName(item.name, item.searchNames, search) ||
        (item.set && containsName(item.set.name, item.set.searchNames, search))) &&
      itemMatchesStats(item, filters.stats),
  );

  filtered.sort(
    (left, right) =>
      right.level - left.level || compareNames(left.name, right.name, locale),
  );
  return paginate(filtered, first, after, 'ItemEdge');
}

export function searchSets(
  nodes: CatalogSet[],
  filters: CatalogSetFilters,
  first: number,
  after?: string | null,
  locale = 'en',
): CatalogConnection<CatalogSet> {
  const search = filters.search.trim();
  const filtered = nodes.filter((set) => {
    const level = setLevel(set);
    if (level < 0 || level > filters.maxLevel) return false;
    if (
      search &&
      !containsName(set.name, set.searchNames, search) &&
      !set.items.some((item) => containsName(item.name, item.searchNames, search))
    ) {
      return false;
    }
    if (!setMatchesStats(set, filters.stats)) return false;
    return setMatchesItemTypeGroups(set, filters.itemTypeIdGroups);
  });

  filtered.sort((left, right) => {
    const levelDifference = setLevel(right) - setLevel(left);
    return levelDifference || compareNames(left.name, right.name, locale);
  });
  return paginate(filtered, first, after, 'SetEdge');
}

export function getSet(nodes: CatalogSet[], id: string): CatalogSet | undefined {
  return nodes.find((set) => set.id === id);
}
