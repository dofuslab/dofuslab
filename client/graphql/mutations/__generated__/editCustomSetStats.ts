/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomSetStatsInput } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: editCustomSetStats
// ====================================================

export interface editCustomSetStats_editCustomSetStats_customSet_stats {
  __typename: "CustomSetStats";
  id: any;
  baseVitality: number;
  baseWisdom: number;
  baseStrength: number;
  baseIntelligence: number;
  baseChance: number;
  baseAgility: number;
  scrolledVitality: number;
  scrolledWisdom: number;
  scrolledStrength: number;
  scrolledIntelligence: number;
  scrolledChance: number;
  scrolledAgility: number;
}

export interface editCustomSetStats_editCustomSetStats_customSet {
  __typename: "CustomSet";
  id: any;
  lastModified: any | null;
  stats: editCustomSetStats_editCustomSetStats_customSet_stats;
}

export interface editCustomSetStats_editCustomSetStats {
  __typename: "EditCustomSetStats";
  customSet: editCustomSetStats_editCustomSetStats_customSet;
}

export interface editCustomSetStats {
  editCustomSetStats: editCustomSetStats_editCustomSetStats | null;
}

export interface editCustomSetStatsVariables {
  customSetId?: any | null;
  stats: CustomSetStatsInput;
}
