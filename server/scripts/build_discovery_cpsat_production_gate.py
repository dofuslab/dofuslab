"""Gate the production Build Discovery GraphQL path with HTTP wall timings."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import platform
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urljoin

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.build_discovery_all_class_smoke import ALL_CLASS_LEVEL_200_TARGETS  # noqa: E402


REPORT_VERSION = "build-discovery-cpsat-http-production-gate-v2"
PERCENTILE_METHOD = "nearest-rank: sorted[ceil(p*n)-1]"
EXPECTED_TARGETS = 19
EXPECTED_WORKERS = 2
EXPECTED_CONCURRENCY = 1
DEFAULT_BASE_URL = os.environ.get("BUILD_DISCOVERY_GATE_BASE_URL", "http://127.0.0.1:5000")
DEFAULT_WARM_REQUESTS = 100
DEFAULT_MAX_MISS_P95_MS = 5000.0
DEFAULT_MAX_HIT_P95_MS = 100.0
DEFAULT_MAX_PEAK_RSS_BYTES = 400 * 1024**2

GRAPHQL_QUERY = """query BuildDiscoveryProductionGate(
  $className: String!, $level: Int!, $elements: [String!], $mode: String!,
  $apTarget: Int!, $mpTarget: Int!, $rangeTarget: Int,
  $damageSurvivabilityPreset: Int!, $budgetTier: Int!, $exoPolicy: String!,
  $limit: Int!, $topK: Int!, $avoidedItemIds: [String!]
) {
  buildDiscovery(
    className: $className, level: $level, elements: $elements, mode: $mode,
    apTarget: $apTarget, mpTarget: $mpTarget, rangeTarget: $rangeTarget,
    damageSurvivabilityPreset: $damageSurvivabilityPreset,
    budgetTier: $budgetTier, exoPolicy: $exoPolicy, limit: $limit, topK: $topK,
    avoidedItemIds: $avoidedItemIds
  )
}"""


def nearest_rank(values: list[float], percentile: float = 0.95) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = max(math.ceil(percentile * len(ordered)) - 1, 0)
    return round(ordered[index], 3)


def timing_summary(values: list[float]) -> dict[str, Any]:
    return {
        "count": len(values),
        "minMs": round(min(values), 3) if values else None,
        "p95Ms": nearest_rank(values),
        "maxMs": round(max(values), 3) if values else None,
    }


def graphql_url(base_url: str) -> str:
    return urljoin(base_url.rstrip("/") + "/", "graphql")


def urllib_json_request(url: str, payload: dict[str, Any], timeout: float) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, separators=(",", ":")).encode("utf-8"),
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code}: {body[:500]}") from error


def target_variables(target: Any, run_key: str, index: int) -> dict[str, Any]:
    # The sentinel participates in cache identity but cannot match a numeric
    # Dofus item id, so it does not alter the candidate set.
    cache_sentinel = "http-gate-" + hashlib.sha256(
        f"{run_key}:{index}:{target.name}".encode("utf-8")
    ).hexdigest()
    return {
        "className": target.class_name,
        "level": target.level,
        "elements": [target.element],
        "mode": "pvm",
        "apTarget": target.ap,
        "mpTarget": target.mp,
        "rangeTarget": target.range_target,
        "damageSurvivabilityPreset": target.preset,
        "budgetTier": target.budget_tier,
        "exoPolicy": target.exo_policy,
        "limit": 1,
        "topK": 25 + index,
        "avoidedItemIds": [cache_sentinel],
    }


def _profile(response: dict[str, Any]) -> dict[str, Any]:
    diagnostics = response.get("diagnostics") or {}
    solver_version = response.get("solverVersion") or diagnostics.get("solverVersion")
    solver = response.get("solver") or diagnostics.get("solver")
    if solver is None and "cpsat" in str(solver_version).lower().replace("-", ""):
        solver = "cpsat"
    return {
        "solver": solver,
        "solverVersion": solver_version,
        "ortoolsVersion": response.get("ortoolsVersion") or diagnostics.get("ortoolsVersion"),
        "runtimeProfile": response.get("runtimeProfile") or diagnostics.get("runtimeProfile"),
        "workers": diagnostics.get("workers") or diagnostics.get("numSearchWorkers"),
        "solverStatus": diagnostics.get("solverStatus"),
        "elapsedMs": diagnostics.get("elapsedMs"),
        "timings": diagnostics.get("timings"),
    }


def _perform(
    request_fn: Callable[[str, dict[str, Any], float], dict[str, Any]],
    clock: Callable[[], float],
    url: str,
    variables: dict[str, Any],
    timeout: float,
) -> dict[str, Any]:
    started = clock()
    try:
        envelope = request_fn(url, {"query": GRAPHQL_QUERY, "variables": variables}, timeout)
        errors = envelope.get("errors") or []
        response = (envelope.get("data") or {}).get("buildDiscovery")
        if not isinstance(response, dict):
            response = {}
            if not errors:
                errors = [{"message": "missing data.buildDiscovery object"}]
    except Exception as error:  # report transport failures in the artifact
        response, errors = {}, [{"message": str(error), "type": type(error).__name__}]
    elapsed_ms = round((clock() - started) * 1000, 3)
    cache = response.get("cache") or {}
    return {
        "wallMs": elapsed_ms,
        "status": response.get("status"),
        "cacheStatus": cache.get("status") or (response.get("diagnostics") or {}).get("cacheStatus"),
        "cacheKey": response.get("cacheKey"),
        "profile": _profile(response),
        "errors": errors,
    }


def run_gate(
    *,
    base_url: str,
    run_key: str,
    request_fn: Callable[[str, dict[str, Any], float], dict[str, Any]] = urllib_json_request,
    clock: Callable[[], float] = time.perf_counter,
    warm_requests: int = DEFAULT_WARM_REQUESTS,
    max_miss_p95_ms: float = DEFAULT_MAX_MISS_P95_MS,
    max_hit_p95_ms: float = DEFAULT_MAX_HIT_P95_MS,
    peak_rss_bytes: int,
    max_peak_rss_bytes: int = DEFAULT_MAX_PEAK_RSS_BYTES,
    timeout: float = 30.0,
) -> dict[str, Any]:
    if warm_requests < 100:
        raise ValueError("warm_requests must be at least 100")
    if not run_key:
        raise ValueError("run_key must be non-empty and unique for an uncached gate run")

    url = graphql_url(base_url)
    cold_rows = []
    variables_by_target = []
    for index, target in enumerate(ALL_CLASS_LEVEL_200_TARGETS):
        variables = target_variables(target, run_key, index)
        variables_by_target.append(variables)
        row = _perform(request_fn, clock, url, variables, timeout)
        row.update({"target": target.name, "query": variables})
        cold_rows.append(row)

    warm_variables = variables_by_target[0]
    warm_rows = [_perform(request_fn, clock, url, warm_variables, timeout) for _ in range(warm_requests)]
    cold_times = [row["wallMs"] for row in cold_rows]
    warm_miss_times = [row["wallMs"] for row in cold_rows[1:]]
    hit_times = [row["wallMs"] for row in warm_rows]
    failures = []
    complete = sum(row["status"] == "complete" and not row["errors"] for row in cold_rows)
    if len(cold_rows) != EXPECTED_TARGETS or complete != EXPECTED_TARGETS:
        failures.append(f"cold matrix complete count must be 19/19, got {complete}/{len(cold_rows)}")
    non_misses = [row["target"] for row in cold_rows if row["cacheStatus"] != "miss"]
    if non_misses:
        failures.append(f"cold requests must report cache miss: {', '.join(non_misses)}")
    bad_hits = sum(row["cacheStatus"] != "hit" or bool(row["errors"]) for row in warm_rows)
    if bad_hits:
        failures.append(f"all warmed requests must be error-free cache hits, got {bad_hits} failures")
    miss_p95 = nearest_rank(cold_times)
    hit_p95 = nearest_rank(hit_times)
    if miss_p95 is None or miss_p95 >= max_miss_p95_ms:
        failures.append(f"cold wall p95 must be < {max_miss_p95_ms:g}ms, got {miss_p95}")
    if hit_p95 is None or hit_p95 >= max_hit_p95_ms:
        failures.append(f"cache-hit wall p95 must be < {max_hit_p95_ms:g}ms, got {hit_p95}")
    if peak_rss_bytes > max_peak_rss_bytes:
        failures.append(
            f"peak RSS must be <= {max_peak_rss_bytes} bytes, got {peak_rss_bytes}"
        )
    invalid_solver_targets = [
        row["target"] for row in cold_rows if row["profile"]["solver"] != "cpsat"
    ]
    if invalid_solver_targets:
        failures.append(
            "response solver must be cpsat for every cold request; invalid targets: "
            + ", ".join(invalid_solver_targets)
        )
    invalid_worker_targets = [
        row["target"]
        for row in cold_rows
        if row["profile"]["workers"] is not None
        and row["profile"]["workers"] != EXPECTED_WORKERS
    ]
    if invalid_worker_targets:
        failures.append(
            f"exposed solver workers must be {EXPECTED_WORKERS}; invalid targets: "
            + ", ".join(invalid_worker_targets)
        )

    profiles = [row["profile"] for row in cold_rows]
    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "status": "pass" if not failures else "fail",
        "endpoint": url,
        "runKey": run_key,
        "percentileMethod": PERCENTILE_METHOD,
        "expectedConfig": {"workers": EXPECTED_WORKERS, "httpConcurrency": EXPECTED_CONCURRENCY},
        "clientRuntime": {"python": platform.python_version(), "implementation": platform.python_implementation()},
        "thresholds": {
            "coldWallP95MsExclusive": max_miss_p95_ms,
            "cacheHitWallP95MsExclusive": max_hit_p95_ms,
            "maxPeakRssBytesInclusive": max_peak_rss_bytes,
        },
        "measurements": {
            "complete": complete,
            "total": len(cold_rows),
            "coldWall": timing_summary(cold_times),
            "warmMissWall": timing_summary(warm_miss_times),
            "cacheHitWall": timing_summary(hit_times),
            "peakRssBytes": peak_rss_bytes,
        },
        "observedProfiles": profiles,
        "failures": failures,
        "coldRequests": cold_rows,
        "warmRequests": warm_rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--run-key", required=True, help="Unique stable key for this uncached run.")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--warm-requests", type=int, default=DEFAULT_WARM_REQUESTS)
    parser.add_argument("--max-miss-p95-ms", type=float, default=DEFAULT_MAX_MISS_P95_MS)
    parser.add_argument("--max-hit-p95-ms", type=float, default=DEFAULT_MAX_HIT_P95_MS)
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--peak-rss-bytes", type=int, required=True)
    args = parser.parse_args()
    report = run_gate(
        base_url=args.base_url, run_key=args.run_key, warm_requests=args.warm_requests,
        max_miss_p95_ms=args.max_miss_p95_ms, max_hit_p95_ms=args.max_hit_p95_ms,
        peak_rss_bytes=args.peak_rss_bytes,
        timeout=args.timeout,
    )
    artifact = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(artifact, encoding="utf-8")
    print(json.dumps({"status": report["status"], "measurements": report["measurements"], "failures": report["failures"]}, indent=2))
    if report["status"] != "pass":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
