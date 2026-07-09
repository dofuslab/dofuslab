import importlib
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app, cache_region, db  # noqa: E402
from app.schema import (  # noqa: E402
    build_discovery_app_cache_key,
    build_discovery_query_from_args,
    schema,
)

schema_module = importlib.import_module("app.schema")


START_MUTATION = """
mutation StartBuildDiscoverySmoke($element: String!, $limit: Int!) {
  startBuildDiscovery(
    elements: [$element]
    limit: $limit
    budgetTier: 4
    exoPolicy: "allow"
  ) {
    job {
      id
      status
      progress
      result
      errorPayload
    }
  }
}
"""


LOOKUP_QUERY = """
query BuildDiscoveryJobSmoke($id: UUID!) {
  buildDiscoveryJob(id: $id) {
    id
    status
    progress
    result
    errorPayload
  }
}
"""


def require_job_table():
    inspector = db.inspect(db.engine)
    table_names = set(inspector.get_table_names())
    missing = [
        table_name
        for table_name in ("generation_request", "build_discovery_job")
        if table_name not in table_names
    ]
    if missing:
        raise RuntimeError(
            "Missing required table(s): {}. Run `flask db upgrade` in the "
            "server container before this smoke.".format(", ".join(missing))
        )


def execute_graphql(document, variables):
    result = schema.execute(document, variable_values=variables)
    if result.errors:
        raise RuntimeError("; ".join(str(error) for error in result.errors))
    return result.data


def main():
    variables = {"element": "strength", "limit": 3}
    with app.app_context():
        require_job_table()
        query = build_discovery_query_from_args(
            {
                "elements": (variables["element"],),
                "limit": variables["limit"],
                "budget_tier": 4,
                "exo_policy": "allow",
            }
        )
        cache_region.delete(build_discovery_app_cache_key(query))

        enqueued_jobs = []
        with patch.object(
            schema_module.q,
            "enqueue",
            side_effect=lambda fn, *args, **kwargs: enqueued_jobs.append(
                (fn, args, kwargs)
            ),
        ):
            start_data = execute_graphql(START_MUTATION, variables)
        started_job = start_data["startBuildDiscovery"]["job"]
        if started_job["status"] != "queued":
            raise RuntimeError(
                "Expected a queued job after forced cache miss, got {}.".format(
                    started_job["status"]
                )
            )
        if len(enqueued_jobs) != 1:
            raise RuntimeError(
                "Expected exactly one enqueued worker task, got {}.".format(
                    len(enqueued_jobs)
                )
            )
        worker_fn, worker_args, _ = enqueued_jobs[0]
        if worker_args != (started_job["id"],):
            raise RuntimeError(
                "Expected worker args to contain job id {}, got {}.".format(
                    started_job["id"],
                    worker_args,
                )
            )

        worker_result = worker_fn(*worker_args)
        if worker_result is not True:
            raise RuntimeError("Worker did not report a successful job run.")

        lookup_data = execute_graphql(LOOKUP_QUERY, {"id": started_job["id"]})
        completed_job = lookup_data["buildDiscoveryJob"]
        if completed_job["status"] != "succeeded":
            raise RuntimeError(
                "Expected succeeded job after worker run, got {}: {}".format(
                    completed_job["status"],
                    completed_job.get("errorPayload"),
                )
            )

        result = completed_job["result"] or {}
        builds = result.get("builds") or []
        if not builds:
            raise RuntimeError("Completed job returned no builds.")

        print(
            "Build Discovery async smoke passed: job={} builds={} cache={}".format(
                completed_job["id"],
                len(builds),
                (result.get("cache") or {}).get("status"),
            )
        )


if __name__ == "__main__":
    main()
