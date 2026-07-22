import { ItemFilters, SetFilters } from '../__generated__/globalTypes';
import { items as ItemsQuery } from '../graphql/queries/__generated__/items';
import { sets as SetsQuery } from '../graphql/queries/__generated__/sets';

export type CatalogKind = 'items' | 'sets';

type GeneratedCatalogItem = ItemsQuery['items']['edges'][number]['node'];
type GeneratedCatalogItemStat = GeneratedCatalogItem['stats'][number];

// minValue has been added to the catalog fragment but this remains optional so
// the engine can also read catalogs written by the first prototype schema.
export type CatalogItem = Omit<GeneratedCatalogItem, 'stats' | 'set'> & {
  stats: Array<GeneratedCatalogItemStat & { minValue?: number | null }>;
  searchNames?: string[];
  set: (GeneratedCatalogItem['set'] & { searchNames?: string[] }) | null;
};
type GeneratedCatalogSet = SetsQuery['sets']['edges'][number]['node'];
export type CatalogSet = Omit<GeneratedCatalogSet, 'items'> & {
  searchNames?: string[];
  items: CatalogItem[];
};

export type CatalogNodesByKind = {
  items: CatalogItem[];
  sets: CatalogSet[];
};

export type CatalogItemFilters = ItemFilters;
export type CatalogSetFilters = SetFilters;

export type CatalogEdge<T> = {
  __typename: 'ItemEdge' | 'SetEdge';
  cursor: string;
  node: T;
};

export type CatalogConnection<T> = {
  edges: Array<CatalogEdge<T>>;
  pageInfo: {
    __typename: 'PageInfo';
    hasNextPage: boolean;
    endCursor: string | null;
  };
};
