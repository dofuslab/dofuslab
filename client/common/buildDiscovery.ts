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
  buildDiscoveryVariablesFromInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  parseBuildDiscoveryResponse,
} from 'common/buildDiscoveryContract';
export type {
  BuildDiscoveryBuild,
  BuildDiscoveryCacheStatus,
  BuildDiscoveryElement,
  BuildDiscoveryQueryInput,
  BuildDiscoveryResponse,
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
