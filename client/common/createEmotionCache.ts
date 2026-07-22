import createCache from '@emotion/cache';

const createEmotionCache = () =>
  createCache({
    key: 'css',
    prepend: true,
  });

export default createEmotionCache;
