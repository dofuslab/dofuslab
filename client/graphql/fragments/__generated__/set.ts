/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Stat } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: set
// ====================================================

export interface set_bonuses {
  __typename: "SetBonus";
  id: any;
  numItems: number;
  stat: Stat | null;
  value: number | null;
  customStats: (string | null)[] | null;
}

export interface set {
  __typename: "Set";
  id: any;
  name: string;
  bonuses: set_bonuses[];
}
