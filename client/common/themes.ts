import {
  gray5,
  gray8,
  gray9,
  gray7,
  gray3,
  gray2,
  gray6,
  gray11,
  gray4,
  gray12,
  gray10,
  blue6,
  red8,
  red5,
} from './mixins';

export const DARK_THEME_NAME = 'DARK';
export const LIGHT_THEME_NAME = 'LIGHT';

export type TTheme = {
  name: string;
  body?: {
    background: string;
  };
  header?: {
    background?: string;
  };
  text?: {
    default?: string;
    light?: string;
    link?: {
      default?: string;
    };
    danger?: string;
    primary?: string;
  };
  border?: {
    default?: string;
    selected?: string;
    primarySelected?: string;
  };
  layer?: {
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
};

export const lightTheme: TTheme = {
  name: LIGHT_THEME_NAME,
  text: {
    link: {
      default: gray8,
    },
    light: gray6,
    danger: red8,
    primary: blue6,
  },
  border: {
    default: gray5,
    selected: gray6,
    primarySelected: blue6,
  },
  layer: {
    background: 'white',
  },
  header: {
    background: 'white',
  },
  statEditor: {
    categoryBackground: gray7,
    remainingPointsBackground: gray3,
  },
  damage: {
    nonCrit: {
      background: gray2,
      color: gray6,
    },
  },
  badge: {
    background: gray7,
  },
  scrollbar: {
    background: gray5,
    trackBackground: gray4,
    buttonBorder: 'rgba(0, 0, 0, 0.15)',
  },
  switch: {
    background: 'rgba(0, 0, 0, 0.25)',
  },
};

const darkColors = {
  defaultText: 'rgba(255, 255, 255, 0.65)',
};

export const darkTheme: TTheme = {
  name: DARK_THEME_NAME,
  body: {
    background: gray12,
  },
  text: {
    default: darkColors.defaultText,
    light: gray8,
    danger: red5,
    primary: blue6,
  },
  border: {
    default: gray10,
    selected: gray9,
    primarySelected: blue6,
  },
  layer: {
    background: gray11,
    backgroundLight: gray10,
  },
  header: {
    background: gray11,
  },
  statEditor: {
    categoryBackground: gray9,
    remainingPointsBackground: gray9,
  },
  damage: {
    nonCrit: {
      background: gray9,
      color: gray7,
    },
  },
  badge: {
    background: gray9,
  },
  scrollbar: {
    background: gray9,
    trackBackground: gray11,
    buttonBorder: 'rgba(255, 255, 255, 0.3)',
  },
  switch: {
    background: 'rgba(255, 255, 255, 0.2)',
    button: 'rgba(255, 255, 255, 0.8)',
  },
  backTop: {
    background: 'rgba(255, 255, 255, 0.2)',
    hoverBackground: 'rgba(255, 255, 255, 0.3)',
  },
  card: {
    background: gray11,
  },
};
