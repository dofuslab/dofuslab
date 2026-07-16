import { MutationHookOptions, useMutation } from '@apollo/client';
import { useCallback } from 'react';

import buildDiscoveryMutation from 'graphql/mutations/buildDiscovery.graphql';
import {
  buildDiscovery,
  buildDiscoveryVariables,
} from 'graphql/mutations/__generated__/buildDiscovery';
import {
  buildDiscoveryVariablesFromInput,
  BuildDiscoveryQueryInput,
  normalizeBuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';

export {
  buildDiscoveryExoLabels,
  buildDiscoveryResultKey,
  buildDiscoveryVariablesFromInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  formatBuildDiscoveryLabel,
  generatedBuildName,
  normalizeBuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';
export type {
  BuildDiscoveryBuild,
  BuildDiscoveryElement,
  BuildDiscoveryImportContext,
  BuildDiscoveryQueryInput,
  BuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';

export function useBuildDiscoveryMutation(
  options: Omit<
    MutationHookOptions<buildDiscovery, buildDiscoveryVariables>,
    'variables'
  > = {},
) {
  const [mutate, result] = useMutation<buildDiscovery, buildDiscoveryVariables>(
    buildDiscoveryMutation,
    options,
  );
  const run = useCallback(
    async (input: BuildDiscoveryQueryInput = {}) => {
      const mutationResult = await mutate({
        variables: buildDiscoveryVariablesFromInput(input),
      });
      const response = mutationResult.data?.buildDiscovery;
      if (!response) {
        throw new Error('Build generation returned no result.');
      }
      return normalizeBuildDiscoveryResponse(response);
    },
    [mutate],
  );

  return {
    ...result,
    buildDiscovery: run,
  };
}
