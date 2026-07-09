import type { buildDiscoveryVariables } from 'graphql/queries/__generated__/buildDiscovery';

export type BuildDiscoveryElement =
  | 'strength'
  | 'intelligence'
  | 'chance'
  | 'agility';

export type BuildDiscoveryCacheStatus = 'hit' | 'miss';

export type BuildDiscoveryQueryInput = Omit<
  buildDiscoveryVariables,
  'className' | 'level' | 'mode' | 'elements'
> & {
  className?: 'Iop';
  level?: 200;
  mode?: 'pvm';
  element?: BuildDiscoveryElement;
  elements?: [BuildDiscoveryElement];
};

export type BuildDiscoveryResponse = {
  datasetVersion?: string;
  solverVersion?: string;
  cacheKey?: string;
  cache?: {
    status?: BuildDiscoveryCacheStatus;
    storage?: string;
  };
  status?: string;
  query?: Record<string, unknown>;
  targetSemantics?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  target?: Record<string, unknown>;
  scoring?: Record<string, unknown>;
  warnings: string[];
  diagnostics: {
    elapsedMs?: number;
    cacheHit?: boolean;
    appCacheHit?: boolean;
    resultCount?: number;
    timings?: Record<string, number>;
  };
  builds: BuildDiscoveryBuild[];
};

export type BuildDiscoveryBuild = {
  score?: number;
  totals?: Record<string, number>;
  exos?: Record<
    string,
    {
      itemId?: string;
      slot?: string | null;
    }
  >;
  items?: Record<
    string,
    {
      id?: string;
      name?: string;
      type?: string;
      level?: number;
      set?: string | null;
    }
  >;
  [key: string]: unknown;
};

export const BUILD_DISCOVERY_EXO_STAT_MAP = {
  AP: 'AP',
  MP: 'MP',
  Range: 'RANGE',
} as const;

export function formatBuildDiscoveryLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildDiscoveryItemIds(build: BuildDiscoveryBuild) {
  return Object.values(build.items ?? {})
    .map((item) => item.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export function buildDiscoveryHasExos(build: BuildDiscoveryBuild) {
  return Object.keys(build.exos ?? {}).length > 0;
}

export function buildDiscoveryHasUnsupportedExos(build: BuildDiscoveryBuild) {
  return Object.keys(build.exos ?? {}).some(
    (stat) =>
      !Object.prototype.hasOwnProperty.call(BUILD_DISCOVERY_EXO_STAT_MAP, stat),
  );
}

export function buildDiscoveryExoLabels(build: BuildDiscoveryBuild) {
  return Object.entries(build.exos ?? {}).map(([stat, exo]) => {
    const slotLabel = exo.slot
      ? formatBuildDiscoveryLabel(exo.slot)
      : 'Unknown slot';
    const itemName = Object.values(build.items ?? {}).find(
      (item) => item.id === exo.itemId,
    )?.name;

    return {
      key: `${stat}:${exo.itemId ?? slotLabel}`,
      label: `${stat} exo - ${itemName ?? exo.itemId ?? slotLabel}`,
    };
  });
}

export function normalizeBuildDiscoverySlotName(
  value: string | null | undefined,
) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? null;
}

export function buildDiscoveryNumberedSlotParts(
  value: string | null | undefined,
) {
  const normalized = normalizeBuildDiscoverySlotName(value);
  const match = normalized?.match(/^([a-z]+)([0-9]+)$/);

  if (!match) {
    return { family: normalized, index: null };
  }

  return {
    family: match[1],
    index: Number(match[2]) - 1,
  };
}

export const DEFAULT_BUILD_DISCOVERY_INPUT: Required<
  Pick<
    BuildDiscoveryQueryInput,
    | 'className'
    | 'level'
    | 'mode'
    | 'element'
    | 'apTarget'
    | 'mpTarget'
    | 'rangeTarget'
    | 'damageSurvivabilityPreset'
    | 'budgetTier'
    | 'exoPolicy'
    | 'weaponPolicy'
    | 'lockedItemIds'
    | 'avoidedItemIds'
    | 'limit'
  >
> = {
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

export function buildDiscoveryVariablesFromInput(
  input: BuildDiscoveryQueryInput = {},
): buildDiscoveryVariables {
  const merged = {
    ...DEFAULT_BUILD_DISCOVERY_INPUT,
    ...input,
  };
  const elements = input.elements ?? [merged.element];
  const { element, ...variables } = merged;

  return {
    ...variables,
    elements,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function parseDiagnostics(
  value: unknown,
): BuildDiscoveryResponse['diagnostics'] {
  if (!isRecord(value)) {
    return {};
  }

  return {
    elapsedMs: optionalNumber(value.elapsedMs),
    cacheHit: optionalBoolean(value.cacheHit),
    appCacheHit: optionalBoolean(value.appCacheHit),
    resultCount: optionalNumber(value.resultCount),
    timings: isRecord(value.timings)
      ? Object.fromEntries(
          Object.entries(value.timings).filter(
            (entry): entry is [string, number] => {
              return typeof entry[1] === 'number';
            },
          ),
        )
      : undefined,
  };
}

export function parseBuildDiscoveryResponse(
  value: unknown,
): BuildDiscoveryResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    datasetVersion: optionalString(value.datasetVersion),
    solverVersion: optionalString(value.solverVersion),
    cacheKey: optionalString(value.cacheKey),
    cache: isRecord(value.cache)
      ? {
          status:
            value.cache.status === 'hit' || value.cache.status === 'miss'
              ? value.cache.status
              : undefined,
          storage: optionalString(value.cache.storage),
        }
      : undefined,
    status: optionalString(value.status),
    query: optionalRecord(value.query),
    targetSemantics: optionalRecord(value.targetSemantics),
    profile: optionalRecord(value.profile),
    target: optionalRecord(value.target),
    scoring: optionalRecord(value.scoring),
    warnings: Array.isArray(value.warnings)
      ? value.warnings.filter(
          (warning): warning is string => typeof warning === 'string',
        )
      : [],
    diagnostics: parseDiagnostics(value.diagnostics),
    builds: Array.isArray(value.builds)
      ? value.builds
          .filter(isRecord)
          .map((build) => build as BuildDiscoveryBuild)
      : [],
  };
}
