# Flask 3 compatibility boundary

This follow-on keeps the Python 3.12 container, Graphene 2 schema, SQLAlchemy
1.4 models, Redis session representation, and RQ 1.x job format unchanged. It
updates Flask to 3.1.3, Werkzeug to 3.1.9, and Flask-Babel to 4.0.0 to remove
the eight advisories left by the interpreter upgrade.

## Advisory disposition

- Flask's missing `Vary: Cookie` behavior can affect cache correctness for
  session-aware responses. Flask 3.1.3 provides access tracking, but the
  retained Flask-Session 0.5 Redis interface owns response persistence and
  does not emit the header itself. The application wrapper now propagates
  Flask's access signal to `Vary: Cookie`; cookie-free health responses remain
  exempt so probes are not made session-dependent.
- Werkzeug's multipart limit bypass is in the HTTP request path and is fixed
  by Werkzeug 3.1.9. Gunicorn does not provide that parser fix.
- The Werkzeug debugger advisory is not reachable through the production
  Gunicorn command, but upgrading removes the vulnerable code version.
- Five `safe_join` advisories are Windows-specific and the proposed runtime is
  Linux. The application also does not call `safe_join` or
  `send_from_directory`; upgrading nevertheless removes the findings.

`pip check` and `pip-audit 2.9.0` must both be clean on the built image before
review. A clean package audit alone is not proof that extension overrides use
the patched framework behavior, which is why the Redis-backed response path is
covered by an application regression test. This is not permission to deploy
it.

## Compatibility approach

Flask-SQLAlchemy 2 cannot import on Flask 3, while Flask-SQLAlchemy 3 requires
SQLAlchemy 2 and conflicts with the current Graphene-SQLAlchemy line. The app
already declares its models on its own `Base`, so runtime session ownership is
moved to SQLAlchemy's existing `scoped_session`. Flask-Migrate continues to
receive that same metadata. The Flask-SQLAlchemy 2 distribution remains locked
only because Flask-Migrate declares it as a dependency; application runtime
code no longer imports it.

This avoids a broad Graphene or schema redesign. Regression coverage verifies
the migration chain, login/session/current-user/logout flow, representative
mutation names, GraphQL validation errors, rate limiting, registered error
handlers, localization, mocked SES configuration, and RQ serialization.

## Stateful rollout and rollback

This change does not upgrade Flask-Session, Redis, RQ, or the serializers they
use. Follow the queue-drain and side-by-side candidate process in the
production container runbook. Preserve Redis, the existing session cookie
name and flags, and the previous API/worker images. Do not flush sessions or
queues. A proxy cutback to the retained image is the application rollback;
PostgreSQL and Redis are not rolled back with it.

## Async boundary

Do not blanket-convert this application to `async`/`await`. Its Flask request
handlers, SQLAlchemy session, Redis access, and RQ workers are synchronous, so
mixing execution models here would enlarge the compatibility change without a
measured benefit. Independent outbound I/O is the concrete future candidate:
email delivery and any future external API/image fetch should remain or become
RQ jobs, where slow network calls do not hold a Gunicorn request worker. If a
future endpoint needs several concurrent external requests, benchmark an
async client or isolated service as a separate change.
