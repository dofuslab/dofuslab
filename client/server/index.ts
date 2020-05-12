import express from 'express';
import next from 'next';
import nextI18NextMiddleware from 'next-i18next/middleware';
import nextI18next from '../i18n';

const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  await nextI18next.initPromise;
  await express()
    .use(nextI18NextMiddleware(nextI18next))
    .get('/build/:customSetId', (req, res) =>
      app.render(req, res, '/index', {
        customSetId: req.params.customSetId,
        ...req.query,
      }),
    )
    .get('*', (req, res) => handle(req, res))
    .listen(port);
  console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
})();
