# Production container runbook

This is a reviewable container scaffold, not an authorization to change the
production host. It deliberately leaves the managed PostgreSQL database, the
self-hosted Redis instance, TLS termination/reverse proxy, and their data where
they are today.

The same API image runs both Gunicorn and the RQ worker. The `web` service is
behind the `frontend` Compose profile. Enabling it replaces the old
`pm2 deploy production` path with a built Next.js artifact; deploying only the
default API/worker services does **not** remove PM2 from the frontend.

## Runtime boundaries

- `api` runs Gunicorn as UID/GID 10001 and binds only to host loopback.
- `worker` uses the exact same image and dependency set as `api`.
- `web` runs Next.js as UID/GID 10001 and binds only to host loopback.
- PostgreSQL and Redis are not defined or published by the production compose
  file. Point the containers at the existing services through runtime-injected
  settings.
- Docker's `json-file` logs are capped at five 10 MiB files per service.
- `/health/live` tests the API process. `/health/ready` tests PostgreSQL and
  Redis without changing either store.

The current development `docker-compose.yml`, sample credentials, and debug
ports are intentionally separate and are not suitable for production.

## Host prerequisites

Before a cutover, install a currently supported Docker Engine and Compose
plugin using the operating system vendor/Docker instructions. Do not expose the
Docker socket, make it remotely reachable, or broadly change socket/group
permissions to work around access errors. The operator needs deliberate access
to Docker and read-only access to the release checkout plus the runtime env
file.

The existing PM2 configuration performs a remote Git checkout, installs and
builds dependencies on the server, then reloads a watched process. Any failure
in SSH identity selection, release-directory ownership, NVM/Node paths, Yarn
cache permissions, build resources, or PM2 ownership can break that chain. The
repository alone cannot identify which of those caused the historical error.
The image flow moves checkout/install/build ahead of cutover and runs one
prebuilt artifact; it does not make Docker socket permissions disappear.

## Configuration

Keep two root-owned files outside the checkout. `/etc/dofuslab/compose.env`
contains non-secret compose inputs:

```dotenv
DOFUSLAB_RELEASE=replace-with-git-sha
DOFUSLAB_RUNTIME_ENV=/etc/dofuslab/runtime.env
DOFUSLAB_PUBLIC_GRAPHQL_URI=https://dofuslab.io/api/graphql
# Candidate-only loopback ports; keep the current 5000/3000 processes alive.
DOFUSLAB_API_PORT=5001
DOFUSLAB_WEB_PORT=3001
GUNICORN_WORKERS=2
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=60
```

`/etc/dofuslab/runtime.env` contains runtime application settings. Never copy
it into an image or commit it. Start from the complete set of names in
`server/.env.dist`, reconcile it against the current host configuration, and
preserve every existing production value; the placeholders below are not
credentials and must not replace working values:

```dotenv
FLASK_APP=app
FLASK_ENV=production
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@MANAGED-DB:25060/DB?sslmode=require
SECRET_KEY=replace-with-existing-production-secret
SESSION_COOKIE_DOMAIN=.dofuslab.io
SESSION_COOKIE_SAMESITE=Lax
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
HOST=dofuslab.io
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_URL=redis://host.docker.internal:6379/0
AWS_ACCESS_KEY_ID=replace-with-existing-runtime-value
AWS_SECRET_ACCESS_KEY=replace-with-existing-runtime-value
SES_REGION=replace-with-existing-runtime-value
SES_EMAIL_SOURCE=replace-with-existing-runtime-value
HOME_PAGE=https://dofuslab.io/
```

`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_REGION`, and
`SES_EMAIL_SOURCE` are required by verification and password-reset email jobs.
Container health checks do not exercise SES and therefore cannot prove email
delivery. Before cutover, run the mocked email task test and have an authorized
operator perform a separately approved end-to-end email check; this runbook
does not authorize reading credentials or sending an external email.

Preserve the existing PostgreSQL TLS parameters. If Redis is bound only to
host loopback, bridge containers cannot reach it through
`host.docker.internal`; prefer a narrowly firewalled host bridge address or a
Unix-socket-aware proxy rather than publishing Redis publicly. Resolve and test
that host networking choice before cutover.

## Build and verify an immutable release

From an exact reviewed commit, set `DOFUSLAB_RELEASE` in `compose.env` to the
full Git SHA, then build once:

```sh
docker compose --env-file /etc/dofuslab/compose.env \
  -f docker-compose.production.yml build --pull
docker compose --profile frontend --env-file /etc/dofuslab/compose.env \
  -f docker-compose.production.yml build --pull web
docker compose --env-file /etc/dofuslab/compose.env \
  -f docker-compose.production.yml config --quiet
docker image inspect "dofuslab-api:$(git rev-parse HEAD)" \
  --format '{{.Id}}'
docker image inspect "dofuslab-web:$(git rev-parse HEAD)" \
  --format '{{.Id}}'
```

Record both image IDs with the release. Test against disposable PostgreSQL and
Redis services before touching production. At minimum verify:

1. `/health/live` returns 200 and `/health/ready` returns 200.
2. Login/session continuity and cookie flags through the existing proxy.
3. A disposable RQ job is consumed by the worker.
4. GraphQL reads and a representative authorized write.
5. The web container serves pages and calls the expected production API URL.
6. SIGTERM lets Gunicorn requests and RQ work stop within the configured grace
   periods.
7. `pytest -q tests/test_runtime_dependencies.py` passes with SES fully mocked;
   treat a real delivery check as a separate operator action.

The shared API image also supports reviewed one-shot jobs without adding a
second dependency universe. For example, once the independent weekly trainer
wrapper is merged, its scheduler can override the image command with
`docker compose run --rm --no-deps worker <trainer command>`. Scheduling,
locking, timeouts, and publication semantics belong to that trainer change;
they are intentionally not duplicated in this scaffold.

## Proposed cutover (do not run without a separate approval)

Back up Redis first and verify the backup can be read. Redis holds sessions,
queued jobs, and suggestions, so replacing or flushing it is not part of this
cutover. Confirm the managed PostgreSQL backup/restore point, but do not run
schema migrations as part of the container start.

Drain or pause enqueueing before changing the worker. Let active jobs finish,
record queue counts, and keep the previous worker image until queued payloads
have been tested against the new version. Confirm the candidate loopback ports
are unused, then start the exact images without rebuilding. The defaults use
`5001` and `3001` specifically so the current services on `5000` and `3000`
can remain live during validation:

```sh
docker compose --env-file /etc/dofuslab/compose.env \
  -f docker-compose.production.yml up -d --no-build --remove-orphans
docker compose --env-file /etc/dofuslab/compose.env \
  -f docker-compose.production.yml ps
curl --fail --silent http://127.0.0.1:5001/health/ready
```

That command changes only the API and worker. Switch the reverse proxy's API
upstream to `127.0.0.1:5001` only after readiness and application checks pass;
keep the old API process on `5000` available until the new upstream has served
real traffic successfully.

When the separately reviewed frontend artifact is ready, start its candidate
alongside PM2:

```sh
docker compose --profile frontend --env-file /etc/dofuslab/compose.env \
  -f docker-compose.production.yml up -d --no-build web
curl --fail --silent http://127.0.0.1:3001/
```

Only after the loopback web check passes should the existing reverse proxy
upstream be switched from PM2 on `127.0.0.1:3000` to the candidate on
`127.0.0.1:3001`. Keep TLS, the public hostname, and all other proxy rules
unchanged for this first cutover. Stop or disable the old API and PM2 apps only
after the proxy is serving the containers and rollback has been rehearsed.

## Rollback

Keep the previous tagged images on the host. Restore the prior
`DOFUSLAB_RELEASE` value and run the same API/worker `up` command with
`--no-build`. For the frontend, include `--profile frontend` and target `web`.
The pre-container frontend fallback is to switch the reverse proxy upstream
back to the still-retained PM2 process on `127.0.0.1:3000`; the API fallback is
to switch its upstream back to the retained process on `127.0.0.1:5000`. Do
not roll Redis or PostgreSQL back merely to roll application containers back.

For the initial Python-only container scaffold, Redis/RQ serialization is
unchanged. A later Python/dependency upgrade must prove that existing sessions,
queued job payloads, and suggestion values can be read by both old and new
releases before it can use this rollback model. If that proof is absent, drain
the queue and plan a forward-only worker cutover rather than assuming rollback
is safe.
