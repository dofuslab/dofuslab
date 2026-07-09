/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type startBuildDiscoveryVariables = Types.Exact<{
  className?: Types.InputMaybe<Types.Scalars['String']['input']>;
  level?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  elements?: Types.InputMaybe<
    Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']
  >;
  mode?: Types.InputMaybe<Types.Scalars['String']['input']>;
  apTarget?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  mpTarget?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  rangeTarget?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  damageSurvivabilityPreset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  budgetTier?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  exoPolicy?: Types.InputMaybe<Types.Scalars['String']['input']>;
  weaponPolicy?: Types.InputMaybe<Types.Scalars['String']['input']>;
  lockedItemIds?: Types.InputMaybe<
    Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']
  >;
  avoidedItemIds?: Types.InputMaybe<
    Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']
  >;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  topK?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  beamWidth?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perSignatureCap?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  relevantSetLimit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  maxSharedItems?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type startBuildDiscovery = {
  startBuildDiscovery: {
    __typename: 'StartBuildDiscovery';
    job: {
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
    };
  } | null;
};
