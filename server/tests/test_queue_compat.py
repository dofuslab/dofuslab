from datetime import datetime, timezone
from operator import add

from worker import BackwardCompatibleJob, redis_connection


def test_unset_timestamps_are_omitted_for_rq_13_workers():
    job = BackwardCompatibleJob.create(add, args=(1, 2), connection=redis_connection)

    serialized = job.to_dict()

    assert "started_at" not in serialized
    assert "ended_at" not in serialized
    assert "last_heartbeat" not in serialized


def test_real_timestamps_are_preserved():
    timestamp = datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc)
    job = BackwardCompatibleJob.create(add, args=(1, 2), connection=redis_connection)
    job.started_at = timestamp

    assert job.to_dict()["started_at"] == "2026-01-02T03:04:05.000000Z"
