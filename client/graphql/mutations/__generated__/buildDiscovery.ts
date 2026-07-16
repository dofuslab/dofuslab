/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
// @ts-nocheck
import * as Types from '../../../__generated__/globalTypes';

export type buildDiscoveryVariables = Types.Exact<{
  input: Types.BuildDiscoveryInput;
}>;

export type buildDiscovery = {
  buildDiscovery: {
    __typename: 'BuildDiscoveryResult';
    status: Types.BuildDiscoveryStatus;
    datasetVersion: string;
    solverVersion: string;
    cacheKey: string | null;
    warnings: Array<string>;
    query: {
      __typename: 'BuildDiscoveryQueryResult';
      className: string;
      level: number;
      elements: Array<string>;
      mode: string;
      apTarget: number;
      mpTarget: number;
      rangeTarget: number | null;
      damageSurvivabilityPreset: number;
      budgetTier: number;
      exoPolicy: string;
      weaponPolicy: string;
      lockedItemIds: Array<string>;
      avoidedItemIds: Array<string>;
      resultLimit: number;
      maxSharedItems: number | null;
    };
    targetSemantics: {
      __typename: 'BuildDiscoveryTargetSemantics';
      type: string;
      surplusScoring: string;
      targets: {
        __typename: 'BuildDiscoveryTargetKinds';
        ap: string;
        mp: string;
        range: string;
      };
      caps: {
        __typename: 'BuildDiscoveryTargetCaps';
        ap: number;
        mp: number;
        range: number;
      };
    };
    noBuildReason: {
      __typename: 'BuildDiscoveryNoBuildReason';
      code: string;
      unavailableItemIds: Array<string>;
      wrongSlotItemIds: Array<string>;
    } | null;
    diagnostics: {
      __typename: 'BuildDiscoveryDiagnostics';
      elapsedMs: number | null;
      cacheHit: boolean | null;
      appCacheHit: boolean | null;
      resultCount: number;
      solver: string | null;
      cacheStatus: string | null;
      solveLockAcquired: boolean | null;
      lockWaitMs: number | null;
      solverStatus: string | null;
      itemCount: number | null;
      candidateCount: number | null;
      maxSharedItems: number | null;
      maxSharedItemsEnforced: boolean | null;
      timings: Array<{
        __typename: 'BuildDiscoveryTiming';
        name: string;
        elapsedMs: number;
      }>;
    };
    cache: {
      __typename: 'BuildDiscoveryCache';
      status: string;
      storage: string;
      solver: string | null;
    };
    builds: Array<{
      __typename: 'BuildDiscoveryBuild';
      promotionToken: string;
      score: number;
      weightedStatScore: number | null;
      utilityStatScore: number | null;
      genericDamageScore: number | null;
      rawRotationDamageScore: number | null;
      spellDamageScore: number | null;
      profileBaselineDamageScore: number | null;
      profileRelativeDamage: number | null;
      weaponDamageScore: number | null;
      survivabilityScore: number | null;
      negativeResistancePenalty: number | null;
      weakestElementEhp: number | null;
      apStrategy: string | null;
      conditionFailures: Array<string>;
      baseAllocation: Array<{
        __typename: 'BuildDiscoveryNamedNumber';
        name: string;
        value: number;
      }>;
      totals: Array<{
        __typename: 'BuildDiscoveryNamedNumber';
        name: string;
        value: number;
      }>;
      sets: Array<{
        __typename: 'BuildDiscoverySet';
        name: string;
        itemCount: number;
      }>;
      exos: Array<{
        __typename: 'BuildDiscoveryExo';
        stat: string;
        itemId: string;
        slot: string | null;
      }>;
      items: Array<{
        __typename: 'BuildDiscoveryItem';
        slot: string;
        id: string;
        internalId: string | null;
        name: string;
        type: string;
        level: number | null;
        set: string | null;
      }>;
    }>;
  };
};
