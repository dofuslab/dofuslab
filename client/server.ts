import express from 'express';
import next from 'next';
import nextI18NextMiddleware from 'next-i18next/middleware';
import nextI18next from './i18n';
import { createReadStream } from 'fs';

const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  await nextI18next.initPromise;
  await express()
    .use(nextI18NextMiddleware(nextI18next))
    .get('/sw.js', (_, res) => {
      res.setHeader('content-type', 'text/javascript');
      createReadStream('./offline/serviceWorker.js').pipe(res);
    })
    .get('/set/:id', (req, res) =>
      app.render(req, res, '/index', { id: req.params.id }),
    )
    .get('*', (req, res) => handle(req, res))
    .listen(port);
  console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
})();
