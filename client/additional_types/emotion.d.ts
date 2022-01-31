import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    name: string;
    body?: {
      background: string;
    };
    header?: {
      background?: string;
    };
    text?: {
      default?: string;
      brightText?: string;
      light?: string;
      link?: {
        default?: string;
      };
      danger?: string;
      primary?: string;
    };
    border: {
      default?: string;
      selected?: string;
      primarySelected?: string;
      light?: string;
    };
    layer: {
      background?: string;
      backgroundLight?: string;
    };
    statEditor?: {
      categoryBackground?: string;
      remainingPointsBackground?: string;
    };
    damage?: {
      nonCrit?: {
        background?: string;
        color?: string;
      };
    };
    badge?: {
      background?: string;
    };
    scrollbar?: {
      trackBackground?: string;
      buttonBorder?: string;
      background?: string;
    };
    switch?: {
      background?: string;
      button?: string;
    };
    backTop?: {
      background?: string;
      hoverBackground?: string;
    };
    card?: {
      background?: string;
    };
  }
}
