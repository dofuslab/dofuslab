"""Session-local database guardrails for recommendation training."""


DEFAULT_STATEMENT_TIMEOUT_MS = 3 * 60 * 60 * 1000 + 30 * 60 * 1000
STATEMENT_TIMEOUT_SQL = (
    "SELECT set_config('statement_timeout', :statement_timeout_ms, true)"
)


def apply_statement_timeout(db_session, statement_timeout_ms):
    """Apply a PostgreSQL timeout to the current transaction only."""
    if statement_timeout_ms <= 0:
        raise ValueError("statement_timeout_ms must be greater than zero")
    db_session.execute(
        STATEMENT_TIMEOUT_SQL, {"statement_timeout_ms": str(statement_timeout_ms)},
    )
