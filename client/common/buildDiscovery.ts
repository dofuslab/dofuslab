import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';

import buildDiscoveryQuery from 'graphql/queries/buildDiscovery.graphql';
import startBuildDiscoveryMutation from 'graphql/mutations/startBuildDiscovery.graphql';
import {
  buildDiscovery,
  buildDiscoveryVariables,
} from 'graphql/queries/__generated__/buildDiscovery';
import {
  startBuildDiscovery,
  startBuildDiscoveryVariables,
} from 'graphql/mutations/__generated__/startBuildDiscovery';
import {
  buildDiscoveryVariablesFromInput,
  BuildDiscoveryQueryInput,
  parseBuildDiscoveryJob,
  parseBuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';

export {
  BUILD_DISCOVERY_EXO_STAT_MAP,
  buildDiscoveryExoLabels,
  buildDiscoveryHasExos,
  buildDiscoveryHasUnsupportedExos,
  buildDiscoveryImportItems,
  buildDiscoveryItemIds,
  parseBuildDiscoveryJob,
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
  BuildDiscoveryJob,
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

export function useStartBuildDiscoveryMutation(
  options: Omit<
    MutationHookOptions<startBuildDiscovery, startBuildDiscoveryVariables>,
    'variables'
  > = {},
) {
  const [mutate, result] = useMutation<
    startBuildDiscovery,
    startBuildDiscoveryVariables
  >(startBuildDiscoveryMutation, options);

  return {
    ...result,
    startBuildDiscovery: (input: BuildDiscoveryQueryInput = {}) =>
      mutate({
        variables: buildDiscoveryVariablesFromInput(
          input,
        ) as startBuildDiscoveryVariables,
      }),
    buildDiscoveryJob: parseBuildDiscoveryJob(
      result.data?.startBuildDiscovery?.job,
    ),
  };
}
