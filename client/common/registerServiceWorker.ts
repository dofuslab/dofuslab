const canUseServiceWorker = () =>
  process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator;

export const cachePublicRouteForOffline = async (navigationUrl: string) => {
  if (!canUseServiceWorker()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    (navigator.serviceWorker.controller ?? registration.active)?.postMessage({
      type: 'CACHE_APP_SHELL',
      navigationUrl,
      assetUrls: [],
    });
  } catch {
    // Online navigation must not depend on service workers.
  }
};

export default function registerServiceWorker() {
  if (!canUseServiceWorker()) return;

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
      );
      await navigator.serviceWorker.ready;

      const assetUrls = performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => {
          const parsedUrl = new URL(url);
          return (
            parsedUrl.origin === window.location.origin &&
            parsedUrl.pathname.startsWith('/_next/static/')
          );
        });

      (navigator.serviceWorker.controller ?? registration.active)?.postMessage({
        type: 'CACHE_APP_SHELL',
        navigationUrl: window.location.href,
        assetUrls,
      });
    } catch {
      // App startup and online behavior must not depend on service workers.
    }
  };

  if (document.readyState === 'complete') {
    void register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}
