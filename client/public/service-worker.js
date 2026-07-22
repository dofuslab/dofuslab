/* global self, caches, fetch */

const CACHE_PREFIX = 'dofuslab-app-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;

const isSameOrigin = (url) => url.origin === self.location.origin;
const isApiRequest = (url) => url.pathname.startsWith('/api/');
const isNextStaticAsset = (url) =>
  isSameOrigin(url) && url.pathname.startsWith('/_next/static/');
const PUBLIC_LOCALES = new Set(['en', 'fr', 'it', 'es', 'pt']);
const isPublicCatalogRoute = (url) => {
  const segments = url.pathname.split('/').filter(Boolean);
  if (PUBLIC_LOCALES.has(segments[0])) segments.shift();

  // Only the static selectors without a custom-set UUID are public documents.
  return (
    segments.length === 2 &&
    segments[0] === 'equip' &&
    (segments[1] === 'set' || /^[a-z]+(?:-\d+)?$/.test(segments[1]))
  );
};

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
            )
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const cacheSuccessfulResponse = async (request, response) => {
  if (response.ok && response.type !== 'opaque') {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
};

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    return cacheSuccessfulResponse(request, response);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
};

const cacheFirstStaticAsset = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  return cacheSuccessfulResponse(request, response);
};

const cacheUrlIfMissing = async (cache, url) => {
  if (await cache.match(url)) return;

  const response = await fetch(url);
  if (response.ok && response.type !== 'opaque') {
    await cache.put(url, response);
  }
};

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_APP_SHELL') return;

  let navigationUrl;
  let assetUrls;
  try {
    navigationUrl = new URL(event.data.navigationUrl);
    assetUrls = Array.isArray(event.data.assetUrls)
      ? event.data.assetUrls.map((url) => new URL(url))
      : [];
  } catch {
    return;
  }
  const urls = [];

  if (
    isSameOrigin(navigationUrl) &&
    !isApiRequest(navigationUrl) &&
    isPublicCatalogRoute(navigationUrl)
  ) {
    urls.push(navigationUrl.href);
  }
  urls.push(
    ...assetUrls.filter(isNextStaticAsset).map((url) => url.href),
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(urls.map((url) => cacheUrlIfMissing(cache, url))),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url) || isApiRequest(url)) return;

  if (request.mode === 'navigate' && isPublicCatalogRoute(url)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isNextStaticAsset(url)) {
    event.respondWith(cacheFirstStaticAsset(request));
  }
});
