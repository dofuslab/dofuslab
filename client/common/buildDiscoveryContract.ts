import type { buildDiscoveryVariables } from 'graphql/queries/__generated__/buildDiscovery';
import type { CustomSetImportedItemInput } from '__generated__/globalTypes';

export type BuildDiscoveryElement =
  | 'strength'
  | 'intelligence'
  | 'chance'
  | 'agility';

export type BuildDiscoveryCacheStatus = 'hit' | 'miss';
export type BuildDiscoveryActionStat = 'AP' | 'MP' | 'Range';
export type BuildDiscoveryTargetSemantics = {
  type?: 'minimum_with_hard_caps';
  targets?: Partial<Record<BuildDiscoveryActionStat, 'minimum'>>;
  caps?: Partial<Record<BuildDiscoveryActionStat, number>>;
  surplusScoring?: 'light_reward_with_cap';
};

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
  targetSemantics?: BuildDiscoveryTargetSemantics;
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

export type BuildDiscoveryImportContext = {
  datasetVersion?: string;
  solverVersion?: string;
  query?: Record<string, unknown>;
  input: BuildDiscoveryQueryInput;
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
      internalId?: string;
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

export function buildDiscoveryResultKey(build: BuildDiscoveryBuild) {
  const itemIds = Object.values(build.items ?? {})
    .map((item) => item.id ?? item.name ?? 'unknown')
    .join(':');

  return `${build.score ?? 'score'}:${itemIds}`;
}

export function generatedBuildName(
  build: BuildDiscoveryBuild,
  context: BuildDiscoveryImportContext,
) {
  const scoreLabel =
    typeof build.score === 'number' ? ` #${Math.round(build.score)}` : '';
  const query = context.query ?? context.input;
  const className =
    typeof query.className === 'string'
      ? query.className
      : context.input.className;
  const element =
    Array.isArray(query.elements) && typeof query.elements[0] === 'string'
      ? query.elements[0]
      : context.input.element;
  const buildLabel =
    element && className
      ? `${formatBuildDiscoveryLabel(element)} ${className}`
      : 'Build Discovery';

  return `Generated ${buildLabel}${scoreLabel}`;
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

export function buildDiscoveryImportItems(build: BuildDiscoveryBuild) {
  const items: CustomSetImportedItemInput[] = [];
  const matchedExoKeys = new Set<string>();
  const exoEntries = Object.entries(build.exos ?? {});
  let hasMissingInternalIds = false;

  Object.entries(build.items ?? {})
    .sort(([leftSlot], [rightSlot]) => {
      const left = buildDiscoveryNumberedSlotParts(leftSlot);
      const right = buildDiscoveryNumberedSlotParts(rightSlot);
      const familyOrder = (left.family ?? '').localeCompare(right.family ?? '');

      if (familyOrder !== 0) {
        return familyOrder;
      }

      return (left.index ?? 0) - (right.index ?? 0);
    })
    .forEach(([slot, item]) => {
      if (typeof item.id !== 'string' || item.id.length === 0) {
        return;
      }

      if (typeof item.internalId !== 'string' || item.internalId.length === 0) {
        hasMissingInternalIds = true;
        return;
      }

      const hasGeneratedExo = (
        stat: keyof typeof BUILD_DISCOVERY_EXO_STAT_MAP,
      ) =>
        exoEntries.some(([exoStat, exo]) => {
          if (exoStat !== stat || exo.itemId !== item.id) {
            return false;
          }

          const exoSlot = buildDiscoveryNumberedSlotParts(exo.slot);
          const itemSlot = buildDiscoveryNumberedSlotParts(slot);

          if (
            exoSlot.family !== itemSlot.family ||
            exoSlot.index !== itemSlot.index
          ) {
            return false;
          }

          matchedExoKeys.add(exoStat);
          return true;
        });

      items.push({
        id: item.internalId,
        apExo: hasGeneratedExo('AP') || undefined,
        mpExo: hasGeneratedExo('MP') || undefined,
        rangeExo: hasGeneratedExo('Range') || undefined,
      });
    });

  return {
    items,
    hasMissingInternalIds,
    hasUnmatchedExos: matchedExoKeys.size !== exoEntries.length,
  };
}

export function buildDiscoveryRequestPayload(
  build: BuildDiscoveryBuild,
  context: BuildDiscoveryImportContext,
) {
  return {
    query: context.query ?? context.input,
    build: {
      key: buildDiscoveryResultKey(build),
      score: build.score,
      itemIds: buildDiscoveryItemIds(build),
      exos: build.exos ?? {},
    },
  };
}

export function generatedExoImportMessage(
  hasUnsupportedExos: boolean,
  hasUnmatchedExos: boolean,
) {
  if (hasUnsupportedExos) {
    return 'Open in builder is disabled for unsupported generated exos.';
  }

  if (hasUnmatchedExos) {
    return 'Open in builder is disabled because generated exos could not be matched to one item slot.';
  }

  return 'Generated AP/MP/Range exos will be imported with this build.';
}

export function generatedImportBlockMessage(
  hasMissingInternalIds: boolean,
  hasUnsupportedExos: boolean,
  hasUnmatchedExos: boolean,
) {
  if (hasMissingInternalIds) {
    return 'Open in builder is disabled because this result is missing generated item import IDs.';
  }

  if (hasUnsupportedExos || hasUnmatchedExos) {
    return generatedExoImportMessage(hasUnsupportedExos, hasUnmatchedExos);
  }

  return null;
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

function isBuildDiscoveryActionStat(
  value: string,
): value is BuildDiscoveryActionStat {
  return Object.prototype.hasOwnProperty.call(
    BUILD_DISCOVERY_EXO_STAT_MAP,
    value,
  );
}

function parseTargetSemantics(
  value: unknown,
): BuildDiscoveryTargetSemantics | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const targets = isRecord(value.targets)
    ? Object.fromEntries(
        Object.entries(value.targets).filter(
          (entry): entry is [BuildDiscoveryActionStat, 'minimum'] =>
            isBuildDiscoveryActionStat(entry[0]) && entry[1] === 'minimum',
        ),
      )
    : undefined;
  const caps = isRecord(value.caps)
    ? Object.fromEntries(
        Object.entries(value.caps).filter(
          (entry): entry is [BuildDiscoveryActionStat, number] =>
            isBuildDiscoveryActionStat(entry[0]) &&
            typeof entry[1] === 'number',
        ),
      )
    : undefined;

  return {
    type: value.type === 'minimum_with_hard_caps' ? value.type : undefined,
    targets,
    caps,
    surplusScoring:
      value.surplusScoring === 'light_reward_with_cap'
        ? value.surplusScoring
        : undefined,
  };
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
    targetSemantics: parseTargetSemantics(value.targetSemantics),
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
