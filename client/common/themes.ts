import {
  gray5,
  gray8,
  gray9,
  gray10,
  gray7,
  gray3,
  gray2,
  gray6,
} from './mixins';

export const DARK_THEME_NAME = 'DARK';
export const LIGHT_THEME_NAME = 'LIGHT';

export type TTheme = {
  name: string;
  header?: {
    background?: string;
  };
  text?: {
    default?: string;
    link?: {
      default?: string;
    };
  };
  border?: {
    default?: string;
  };
  layer?: {
    background?: string;
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
};

export const lightTheme: TTheme = {
  name: LIGHT_THEME_NAME,
  text: {
    link: {
      default: gray8,
    },
  },
  border: {
    default: gray5,
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
};

const darkColors = {
  defaultText: 'rgba(255, 255, 255, 0.65)',
  popoverBackground: '#1f1f1f',
};

export const darkTheme: TTheme = {
  name: DARK_THEME_NAME,
  text: {
    default: darkColors.defaultText,
  },
  border: {
    default: gray9,
  },
  layer: {
    background: gray10,
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
};
