import {
  BuildDiscoveryStatus,
  type BuildDiscoveryInput,
} from '__generated__/globalTypes';
import type {
  buildDiscovery,
  buildDiscoveryVariables,
} from 'graphql/mutations/__generated__/buildDiscovery';

export type BuildDiscoveryElement =
  | 'strength'
  | 'intelligence'
  | 'chance'
  | 'agility';

export type BuildDiscoveryQueryInput = Partial<
  Omit<BuildDiscoveryInput, 'element' | 'resultLimit'>
> & {
  className?: string;
  level?: number;
  mode?: 'pvm';
  element?: BuildDiscoveryElement;
  limit?: number;
};

type TypedBuildDiscoveryResponse = buildDiscovery['buildDiscovery'];
type TypedBuildDiscoveryBuild = TypedBuildDiscoveryResponse['builds'][number];

export type BuildDiscoveryImportContext = {
  query?: TypedBuildDiscoveryResponse['query'];
  input: BuildDiscoveryQueryInput;
};

export type BuildDiscoveryBuild = Omit<
  TypedBuildDiscoveryBuild,
  'totals' | 'exos' | 'items'
> & {
  totals: Record<string, number>;
  exos: Record<
    string,
    {
      itemId: string;
      slot?: string | null;
    }
  >;
  items: Record<
    string,
    {
      id: string;
      internalId: string | null;
      name: string;
      type: string;
      level: number | null;
      set: string | null;
    }
  >;
};

export type BuildDiscoveryResponse = Omit<
  TypedBuildDiscoveryResponse,
  'builds' | 'diagnostics'
> & {
  builds: BuildDiscoveryBuild[];
  diagnostics: Omit<TypedBuildDiscoveryResponse['diagnostics'], 'timings'> & {
    timings: Record<string, number>;
  };
};

export function formatBuildDiscoveryLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
  const className = context.query?.className ?? context.input.className;
  const element = context.query?.elements[0] ?? context.input.element;
  const buildLabel =
    element && className
      ? `${formatBuildDiscoveryLabel(element)} ${className}`
      : 'Build Discovery';

  return `Generated ${buildLabel}${scoreLabel}`;
}

export type GenerationRequestSummary = {
  source: string;
  sourceLabel?: string | null;
  datasetVersion?: string | null;
  solverVersion?: string | null;
  displaySummary?: string | null;
};

export function readableGenerationSource(
  source: string,
  buildDiscoveryLabel = 'Build Discovery',
) {
  if (source === 'build_discovery') {
    return buildDiscoveryLabel;
  }

  return source
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function generationRequestDisplaySummary(
  generationRequest: GenerationRequestSummary | null | undefined,
  buildDiscoveryLabel = 'Build Discovery',
) {
  if (!generationRequest) {
    return undefined;
  }
  if (generationRequest.displaySummary) {
    return generationRequest.displaySummary;
  }

  const versions = [
    generationRequest.datasetVersion
      ? `dataset ${generationRequest.datasetVersion}`
      : null,
    generationRequest.solverVersion
      ? `solver ${generationRequest.solverVersion}`
      : null,
  ].filter(Boolean);

  return [
    generationRequest.sourceLabel ??
      readableGenerationSource(generationRequest.source, buildDiscoveryLabel),
    versions.join(' - '),
  ]
    .filter(Boolean)
    .join(' - ');
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
  rangeTarget: null,
  damageSurvivabilityPreset: 3,
  budgetTier: 2,
  exoPolicy: 'allow',
  weaponPolicy: 'stat_stick_allowed',
  lockedItemIds: [],
  avoidedItemIds: [],
  limit: 3,
};

export function buildDiscoveryVariablesFromInput(
  input: BuildDiscoveryQueryInput = {},
): buildDiscoveryVariables {
  const merged = {
    ...DEFAULT_BUILD_DISCOVERY_INPUT,
    ...input,
  };

  return {
    input: {
      className: merged.className,
      level: merged.level,
      element: merged.element,
      apTarget: merged.apTarget,
      mpTarget: merged.mpTarget,
      rangeTarget: merged.rangeTarget ?? null,
      damageSurvivabilityPreset: merged.damageSurvivabilityPreset,
      budgetTier: merged.budgetTier,
      exoPolicy: merged.exoPolicy,
      weaponPolicy: merged.weaponPolicy,
      lockedItemIds: merged.lockedItemIds,
      avoidedItemIds: merged.avoidedItemIds,
      resultLimit: merged.limit,
      maxSharedItems: merged.maxSharedItems,
    },
  };
}

export function normalizeBuildDiscoveryResponse(
  response: TypedBuildDiscoveryResponse,
): BuildDiscoveryResponse {
  const builds = response.builds.map((build) => ({
    ...build,
    totals: Object.fromEntries(
      build.totals.map(({ name, value }) => [name, value]),
    ),
    exos: Object.fromEntries(
      build.exos.map(({ stat, itemId, slot }) => [stat, { itemId, slot }]),
    ),
    items: Object.fromEntries(
      build.items.map(({ slot, ...item }) => [slot, item]),
    ),
  }));

  return {
    ...response,
    diagnostics: {
      ...response.diagnostics,
      timings: Object.fromEntries(
        response.diagnostics.timings.map(({ name, elapsedMs }) => [
          name,
          elapsedMs,
        ]),
      ),
    },
    builds:
      response.status === BuildDiscoveryStatus.NO_VALID_BUILD ? [] : builds,
  };
}
