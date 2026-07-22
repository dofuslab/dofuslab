const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const listeners = {};
const storedResponses = new Map();
let fetchCalls = 0;
let fetchImplementation = async () => {
  fetchCalls += 1;
  return new Response('network response');
};

const requestKey = (request) =>
  typeof request === 'string' ? request : request.url;
const cache = {
  match: async (request) => storedResponses.get(requestKey(request)),
  put: async (request, response) => {
    storedResponses.set(requestKey(request), response);
  },
};

const context = {
  URL,
  Response,
  caches: {
    delete: async () => true,
    keys: async () => [],
    match: async (request) => storedResponses.get(requestKey(request)),
    open: async () => cache,
  },
  fetch: (...args) => fetchImplementation(...args),
  self: {
    addEventListener: (name, listener) => {
      listeners[name] = listener;
    },
    clients: { claim: async () => undefined },
    location: { origin: 'https://dofuslab.test' },
    skipWaiting: () => undefined,
  },
};

vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, 'public/service-worker.js'), 'utf8'),
  context,
);

const dispatchFetch = async (request) => {
  let responsePromise;
  listeners.fetch({
    request,
    respondWith: (promise) => {
      responsePromise = promise;
    },
  });
  return responsePromise;
};

const dispatchMessage = async (data) => {
  let work;
  listeners.message({
    data,
    waitUntil: (promise) => {
      work = promise;
    },
  });
  await work;
};

const request = (pathname, overrides = {}) => ({
  method: 'GET',
  mode: 'cors',
  url: `https://dofuslab.test${pathname}`,
  ...overrides,
});

(async () => {
  assert.equal(
    await dispatchFetch(request('/api/graphql', { method: 'POST' })),
    undefined,
    'GraphQL POST requests are not intercepted',
  );
  assert.equal(
    await dispatchFetch(request('/api/graphql')),
    undefined,
    'API GET requests are not intercepted',
  );
  assert.equal(
    await dispatchFetch(request('/images/item.png')),
    undefined,
    'unrelated runtime assets are not intercepted',
  );

  const privateRoutes = [
    '/en/build/private-uuid/',
    '/en/view/private-uuid/',
    '/en/my-builds/',
    '/en/user/someone/',
    '/en/equip/hat/private-uuid/',
    '/en/equip/set/private-uuid/',
    '/en/equip/not_a_slot/',
    '/en/reset-password/?token=secret',
  ];
  for (const pathname of privateRoutes) {
    const privateNavigation = request(pathname, { mode: 'navigate' });
    assert.equal(
      await dispatchFetch(privateNavigation),
      undefined,
      `${pathname} document is not intercepted`,
    );
    await dispatchMessage({
      type: 'CACHE_APP_SHELL',
      navigationUrl: privateNavigation.url,
      assetUrls: [],
    });
    assert.ok(
      !storedResponses.has(privateNavigation.url),
      `${pathname} document cannot be seeded into the cache`,
    );
  }

  const navigation = request('/en/equip/hat/', { mode: 'navigate' });
  const onlineResponse = await dispatchFetch(navigation);
  assert.equal(await onlineResponse.text(), 'network response');
  assert.equal(fetchCalls, 1, 'visited navigation is fetched from the network');
  assert.ok(
    storedResponses.has(navigation.url),
    'successful navigation is cached for offline reload',
  );

  fetchImplementation = async () => {
    fetchCalls += 1;
    throw new Error('offline');
  };
  const offlineResponse = await dispatchFetch(navigation);
  assert.equal(await offlineResponse.text(), 'network response');

  const staticAsset = request('/_next/static/chunks/app-123.js');
  storedResponses.set(staticAsset.url, new Response('cached asset'));
  const callsBeforeStatic = fetchCalls;
  const staticResponse = await dispatchFetch(staticAsset);
  assert.equal(await staticResponse.text(), 'cached asset');
  assert.equal(
    fetchCalls,
    callsBeforeStatic,
    'Next static assets use the cache before the network',
  );

  fetchImplementation = async () => {
    fetchCalls += 1;
    return new Response('seeded');
  };
  await dispatchMessage({
    type: 'CACHE_APP_SHELL',
    navigationUrl: 'https://dofuslab.test/fr/equip/set/',
    assetUrls: [
      'https://dofuslab.test/_next/static/chunks/new-456.js',
      'https://dofuslab.test/api/graphql',
      'https://cdn.example.test/_next/static/chunks/external.js',
    ],
  });
  assert.ok(storedResponses.has('https://dofuslab.test/fr/equip/set/'));
  assert.ok(
    storedResponses.has(
      'https://dofuslab.test/_next/static/chunks/new-456.js',
    ),
  );
  assert.ok(!storedResponses.has('https://dofuslab.test/api/graphql'));
  assert.ok(
    !storedResponses.has(
      'https://cdn.example.test/_next/static/chunks/external.js',
    ),
  );

  console.log('service-worker tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
