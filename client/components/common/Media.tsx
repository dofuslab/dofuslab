import { createMedia } from '@artsy/fresnel';

import { BREAKPOINTS } from 'common/constants';

export const DofusLabMedia = createMedia({
  breakpoints: {
    mobile: 0,
    tablet: BREAKPOINTS[0],
    xs: BREAKPOINTS[1],
    sm: BREAKPOINTS[2],
    md: BREAKPOINTS[3],
    lg: BREAKPOINTS[4],
    xl: BREAKPOINTS[5],
    xxl: BREAKPOINTS[6],
  },
});

export const mediaStyles = DofusLabMedia.createMediaStyle();

export const { Media, MediaContextProvider } = DofusLabMedia;
