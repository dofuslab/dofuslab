import {
  gray5,
  gray8,
  gray9,
  gray10,
  gray7,
  gray3,
  gray2,
  gray6,
  gray11,
  gray4,
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
    selected?: string;
  };
  layer?: {
    background?: string;
    selectedBackground?: string;
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
    selected: gray6,
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
};

const darkColors = {
  defaultText: 'rgba(255, 255, 255, 0.65)',
};

export const darkTheme: TTheme = {
  name: DARK_THEME_NAME,
  text: {
    default: darkColors.defaultText,
  },
  border: {
    default: gray9,
    selected: gray8,
  },
  layer: {
    background: gray10,
    selectedBackground: gray9,
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
};
