const CACHE_NAME = 'simple-cache-v1';
const urlsToCache = ['/'];

self.addEventListener('install', async event => {
  console.log('install', event);
  const res = await fetch('http://dev.localhost:5000/items.json');
  const items = await res.json();
  console.log(items);
  const preLoaded = caches
    .open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache));
  event.waitUntil(preLoaded);
});

self.addEventListener('fetch', event => {
  console.log('fetch', event);
  const response = caches
    .match(event.request)
    .then(match => match || fetch(event.request));
  event.respondWith(response);
});
