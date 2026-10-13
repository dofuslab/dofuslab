#!/usr/bin/env bash
# Run one bounded recommendation refresh. Scheduling is configured separately.
set -u

CONFIG_FILE="${DOFUSLAB_REFRESH_CONFIG:-/etc/dofuslab/recommendation-refresh.env}"
if [[ ! -r "$CONFIG_FILE" ]]; then
  echo "ERROR: recommendation refresh config is not readable: $CONFIG_FILE" >&2
  exit 78
fi

# Export every assignment loaded from the protected config so application
# settings such as DATABASE_URL and REDIS_* reach the Python process. Nothing
# prints the values because tracing is never enabled.
set -a
# shellcheck source=/dev/null
if ! source "$CONFIG_FILE"; then
  set +a
  echo "ERROR: recommendation refresh config could not be loaded" >&2
  exit 78
fi
set +a

for required_name in DATABASE_URL REDIS_HOST REDIS_PORT; do
  if [[ -z "${!required_name:-}" ]]; then
    echo "ERROR: $required_name must be provided by the refresh config" >&2
    exit 78
  fi
done

: "${DOFUSLAB_SERVER_DIR:?Set DOFUSLAB_SERVER_DIR in the refresh config}"
PYTHON_BIN="${PYTHON_BIN:-$DOFUSLAB_SERVER_DIR/.venv/bin/python}"
RECOMMENDATION_DAYS="${RECOMMENDATION_DAYS:-180}"
RECOMMENDATION_MAX_SECONDS="${RECOMMENDATION_MAX_SECONDS:-14400}"
RECOMMENDATION_LOCK_SECONDS="${RECOMMENDATION_LOCK_SECONDS:-18000}"
RECOMMENDATION_DB_TIMEOUT_MS="${RECOMMENDATION_DB_TIMEOUT_MS:-12600000}"
RECOMMENDATION_PREVIOUS_VERSION_TTL_SECONDS="${RECOMMENDATION_PREVIOUS_VERSION_TTL_SECONDS:-3600}"
REFRESH_LOCK_FILE="${REFRESH_LOCK_FILE:-/run/lock/dofuslab-recommendation-refresh.lock}"

for value_name in RECOMMENDATION_DAYS RECOMMENDATION_MAX_SECONDS RECOMMENDATION_LOCK_SECONDS RECOMMENDATION_DB_TIMEOUT_MS RECOMMENDATION_PREVIOUS_VERSION_TTL_SECONDS; do
  value="${!value_name}"
  if [[ ! "$value" =~ ^[1-9][0-9]*$ ]]; then
    echo "ERROR: $value_name must be a positive integer" >&2
    exit 78
  fi
done

if (( RECOMMENDATION_LOCK_SECONDS <= RECOMMENDATION_MAX_SECONDS )); then
  echo "ERROR: RECOMMENDATION_LOCK_SECONDS must exceed RECOMMENDATION_MAX_SECONDS" >&2
  exit 78
fi
if (( RECOMMENDATION_DB_TIMEOUT_MS >= RECOMMENDATION_MAX_SECONDS * 1000 )); then
  echo "ERROR: RECOMMENDATION_DB_TIMEOUT_MS must be below the process timeout" >&2
  exit 78
fi

if [[ ! -d "$DOFUSLAB_SERVER_DIR" ]]; then
  echo "ERROR: server directory does not exist: $DOFUSLAB_SERVER_DIR" >&2
  exit 78
fi
if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "ERROR: Python executable is not runnable: $PYTHON_BIN" >&2
  exit 78
fi

exec 9>"$REFRESH_LOCK_FILE"
if ! flock -n 9; then
  echo "$(date --iso-8601=seconds) recommendation refresh skipped: local lock is held"
  exit 0
fi

# Prevent native numeric libraries from multiplying CPU/memory usage. The job
# is intentionally lower priority than request-serving processes.
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-1}"
export OPENBLAS_NUM_THREADS="${OPENBLAS_NUM_THREADS:-1}"
export MKL_NUM_THREADS="${MKL_NUM_THREADS:-1}"
export NUMEXPR_NUM_THREADS="${NUMEXPR_NUM_THREADS:-1}"
export MALLOC_ARENA_MAX="${MALLOC_ARENA_MAX:-2}"

cd "$DOFUSLAB_SERVER_DIR" || exit 78
started_at="$(date --iso-8601=seconds)"
echo "$started_at recommendation refresh started (window_days=$RECOMMENDATION_DAYS)"

priority=(nice -n 10)
if command -v ionice >/dev/null 2>&1; then
  priority=(ionice -c 2 -n 7 "${priority[@]}")
fi

timeout --signal=TERM --kill-after=300 "${RECOMMENDATION_MAX_SECONDS}s" \
  "${priority[@]}" "$PYTHON_BIN" -m app.suggester.trainer \
  --days "$RECOMMENDATION_DAYS" --lock-seconds "$RECOMMENDATION_LOCK_SECONDS" \
  --statement-timeout-ms "$RECOMMENDATION_DB_TIMEOUT_MS" \
  --previous-version-ttl-seconds "$RECOMMENDATION_PREVIOUS_VERSION_TTL_SECONDS"
status=$?

if (( status == 0 )); then
  echo "$(date --iso-8601=seconds) recommendation refresh completed"
elif (( status == 75 )); then
  echo "$(date --iso-8601=seconds) recommendation refresh skipped: Redis lock is held"
  status=0
else
  echo "$(date --iso-8601=seconds) ERROR: recommendation refresh failed (exit=$status)" >&2
fi
exit "$status"
