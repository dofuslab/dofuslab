import { QueryHookOptions, useQuery } from '@apollo/client';

import buildDiscoveryQuery from 'graphql/queries/buildDiscovery.graphql';
import {
  buildDiscovery,
  buildDiscoveryVariables,
} from 'graphql/queries/__generated__/buildDiscovery';
import {
  buildDiscoveryVariablesFromInput,
  BuildDiscoveryQueryInput,
  parseBuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';

export {
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
  formatBuildDiscoveryLabel,
  generatedBuildName,
  generatedExoImportMessage,
  generatedImportBlockMessage,
  normalizeBuildDiscoverySlotName,
  parseBuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';
export type {
  BuildDiscoveryActionStat,
  BuildDiscoveryBuild,
  BuildDiscoveryCacheStatus,
  BuildDiscoveryElement,
  BuildDiscoveryImportContext,
  BuildDiscoveryQueryInput,
  BuildDiscoveryResponse,
  BuildDiscoveryTargetSemantics,
} from 'common/buildDiscoveryContract';

export function useBuildDiscoveryQuery(
  input: BuildDiscoveryQueryInput = {},
  options: Omit<
    QueryHookOptions<buildDiscovery, buildDiscoveryVariables>,
    'variables'
  > = {},
) {
  const result = useQuery<buildDiscovery, buildDiscoveryVariables>(
    buildDiscoveryQuery,
    {
      ...options,
      variables: buildDiscoveryVariablesFromInput(input),
    },
  );

  return {
    ...result,
    buildDiscovery: parseBuildDiscoveryResponse(result.data?.buildDiscovery),
  };
}
