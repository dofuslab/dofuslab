/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type buildDiscoveryJobVariables = Types.Exact<{
  id: Types.Scalars['UUID']['input'];
}>;

export type buildDiscoveryJob = {
  buildDiscoveryJob: {
    __typename: 'BuildDiscoveryJob';
    id: string;
    status: string;
    progress: number;
    freshThresholdMs: number;
    elapsedMs: number | null;
    cacheHit: boolean;
    syncRecommended: boolean;
    asyncRecommended: boolean;
    generationRequestSource: string;
    datasetVersion: string | null;
    solverVersion: string | null;
    requestPayload: any | null;
    errorPayload: any | null;
    result: any | null;
  } | null;
};
