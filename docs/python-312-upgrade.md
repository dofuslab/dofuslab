# Python 3.12 upgrade and rollback notes

This change moves the API and RQ worker together from Python 3.8 to Python
3.12.15. It is intentionally stacked on the production container scaffold so
the new interpreter is built and tested as an immutable artifact before any
host cutover. It does not authorize a production deployment, database change,
Redis replacement, or credential change.

## Compatibility boundary

The first supported-Python step deliberately retained Flask 2.2, SQLAlchemy
1.4, and Graphene 2. This separately reviewed follow-on moves Flask and
Werkzeug to supported patched releases while preserving SQLAlchemy 1.4,
Graphene 2, and the existing GraphQL schema. See
`docs/flask-3-compatibility.md` for the deliberately narrow boundary.

The final follow-on image passes `pip check`. A `pip-audit 2.9.0` scan reports
no known vulnerabilities, clearing the eight Flask/Werkzeug advisories left by
the initial Python 3.12 branch. The Graphene/SQLAlchemy modernization remains a
separate project rather than being hidden inside this security update.

The dependency set is curated in `server/requirements.in` and fully resolved
in `server/requirements.txt`. Regenerate the lock only from Python 3.12 in an
isolated environment with a reviewed pip-tools version, then rebuild and rerun
the entire verification set; do not upgrade individual transitive packages on
the host.

SQLAlchemy 1.4 expects the `postgresql+psycopg2://` dialect name. The committed
environment templates use that supported spelling. The application also
normalizes the repository's former `postgres+psycopg2://` prefix once in the
shared Flask configuration boundary. The runtime model engine,
Flask-SQLAlchemy, and Alembic migration engine therefore consume the same
supported URL without altering its encoded credentials, host, database name,
or connection options.

## Stateful compatibility

- Flask-Session remains on the existing Redis/pickle representation. Test
  cookies created by both the Python 3.8 and Python 3.12 images were read by
  the other image.
- RQ stays on its 1.x job format. `BackwardCompatibleJob` omits unset timestamp
  fields that RQ 1.3 cannot deserialize, while preserving real timestamps.
  Real RQ 1.3 jobs ran on the new worker and new compatibility jobs ran on the
  old worker.
- PostgreSQL migrations and seeded application data were exercised against a
  disposable PostgreSQL 14 instance. This upgrade adds no schema migration.
- Redis suggestions and queued work must be preserved. Never flush Redis as
  part of this cutover.

## Candidate rollout

Follow `docs/production-containers.md` first. Build from the exact reviewed
commit and record the image ID. Use the candidate loopback ports (`5001` for
the API and `3001` for the optional web image) so the current processes remain
available.

Before switching traffic:

1. Back up Redis and confirm the current PostgreSQL restore point.
2. Pause enqueueing, let active work finish, and record queue counts.
3. Run migrations against a disposable database, not production, and execute
   the focused API, session, RQ, localization, and mocked-SES tests.
4. Start the candidate API and worker from the recorded image without
   rebuilding. Verify readiness, GraphQL reads, an authorized write, session
   continuity, and a disposable queued job.
5. Switch only the API proxy upstream to the candidate port. Keep the old API
   process and image available until real traffic is healthy.
6. Resume enqueueing gradually and watch worker failures, queue depth, session
   errors, database errors, and latency before stopping the old worker.

Email credentials are runtime-only. The mocked SES test proves configuration
is passed to the task without sending mail; it does not prove external
delivery. Any real delivery test requires separate operator approval.

## Rollback

Pause enqueueing again, switch the proxy upstream back to the retained Python
3.8 API, stop the candidate worker after in-flight jobs finish, and restart the
retained old worker. The bidirectional session and RQ checks support this
application rollback. Do not roll PostgreSQL or Redis back solely because the
application image was rolled back.

If production queue contents differ from the tested job shapes, drain them
before cutover rather than assuming compatibility. Keep the candidate and old
image IDs, queue counts, health results, and rollback timestamps with the
release record.
