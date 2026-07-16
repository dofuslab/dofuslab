from __future__ import annotations

import argparse
import json
import math
import sys
import time
from dataclasses import replace
from pathlib import Path
from typing import Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app  # noqa: E402
from app.build_discovery_service import build_discovery_cached_response  # noqa: E402
from oneoff.build_discovery_core import BuildDiscoveryQuery  # noqa: E402


REPORT_VERSION = "build-discovery-cache-prewarm-v1"
DEFAULT_MAX_HIT_ELAPSED_MS = 500.0
SUPPORTED_IOP_ELEMENTS = ("strength", "intelligence", "chance", "agility")
LOCAL_VALIDATION_SUITE_PROFILES = (
    {
        "id": "balanced-11-6-any",
        "query": BuildDiscoveryQuery(range_target=None, damage_survivability_preset=2),
    },
    {
        "id": "damage-12-6-any",
        "query": BuildDiscoveryQuery(
            ap_target=12,
            range_target=None,
            damage_survivability_preset=3,
            budget_tier=4,
        ),
    },
    {
        "id": "ranged-11-6-4",
        "query": BuildDiscoveryQuery(
            range_target=4,
            damage_survivability_preset=3,
            budget_tier=4,
        ),
    },
)


def elapsed_summary(rows: list[dict]) -> dict:
    values = sorted(row["elapsedMs"] for row in rows)
    if not values:
        return {
            "count": 0,
            "minMs": None,
            "avgMs": None,
            "p95Ms": None,
            "maxMs": None,
        }
    p95_index = max(math.ceil(len(values) * 0.95) - 1, 0)
    return {
        "count": len(values),
        "minMs": values[0],
        "avgMs": round(sum(values) / len(values), 1),
        "p95Ms": values[p95_index],
        "maxMs": values[-1],
    }


def prewarm_query_matrix(
    prewarm_fn: Callable[[BuildDiscoveryQuery], dict],
    elements: tuple[str, ...] = SUPPORTED_IOP_ELEMENTS,
    require_all_hits: bool = False,
    max_hit_p95_ms: float | None = None,
    max_hit_elapsed_ms: float | None = None,
) -> dict:
    rows = []
    for profile in LOCAL_VALIDATION_SUITE_PROFILES:
        profile_query = profile["query"]
        for element in elements:
            query = replace(profile_query, elements=(element,))
            started = time.perf_counter()
            response = prewarm_fn(query)
            elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
            diagnostics = response.get("diagnostics") or {}
            cache = response.get("cache") or {}
            rows.append(
                {
                    "profileId": profile["id"],
                    "element": element,
                    "apTarget": query.ap_target,
                    "mpTarget": query.mp_target,
                    "rangeTarget": query.range_target,
                    "cacheKey": response.get("cacheKey"),
                    "cacheStatus": cache.get("status"),
                    "cacheStorage": cache.get("storage"),
                    "appCacheHit": bool(diagnostics.get("appCacheHit")),
                    "resultCount": diagnostics.get("resultCount", 0),
                    "elapsedMs": elapsed_ms,
                }
            )

    summary = {
        "rowCount": len(rows),
        "cacheHits": sum(1 for row in rows if row["appCacheHit"]),
        "cacheMisses": sum(1 for row in rows if not row["appCacheHit"]),
        "emptyResults": sum(1 for row in rows if row["resultCount"] <= 0),
        "elapsed": elapsed_summary(rows),
        "cacheHitElapsed": elapsed_summary([row for row in rows if row["appCacheHit"]]),
    }
    failures = []
    if summary["emptyResults"]:
        failures.append("one or more supported cache prewarm rows returned no builds")
    if require_all_hits and summary["cacheMisses"]:
        failures.append("one or more supported cache prewarm rows were cache misses")
    if max_hit_p95_ms is not None:
        hit_p95 = summary["cacheHitElapsed"]["p95Ms"]
        if hit_p95 is None or hit_p95 > max_hit_p95_ms:
            failures.append("cache-hit p95 exceeded the max p95 threshold")
    if max_hit_elapsed_ms is not None:
        slow_hit_rows = [
            row
            for row in rows
            if row["appCacheHit"] and row["elapsedMs"] > max_hit_elapsed_ms
        ]
        if slow_hit_rows:
            failures.append(
                "one or more cache-hit rows exceeded the max elapsed threshold"
            )

    return {
        "reportVersion": REPORT_VERSION,
        "status": "pass" if not failures else "fail",
        "requirements": {
            "requireAllHits": require_all_hits,
            "maxHitP95Ms": max_hit_p95_ms,
            "maxHitElapsedMs": max_hit_elapsed_ms,
        },
        "failures": failures,
        "rows": rows,
        "summary": summary,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        help="Optional path for writing the prewarm report JSON.",
    )
    parser.add_argument(
        "--require-all-hits",
        action="store_true",
        help="Fail unless every supported row is already an app-cache hit.",
    )
    parser.add_argument(
        "--max-hit-p95-ms",
        type=float,
        default=None,
        help="Fail when cache-hit p95 elapsed time exceeds this threshold.",
    )
    parser.add_argument(
        "--max-hit-elapsed-ms",
        type=float,
        default=None,
        help=(
            "Fail when any cache-hit row exceeds this elapsed threshold. "
            f"Use {DEFAULT_MAX_HIT_ELAPSED_MS:g} for the current warmed-cache target."
        ),
    )
    args = parser.parse_args()

    with app.app_context():
        report = prewarm_query_matrix(
            build_discovery_cached_response,
            require_all_hits=args.require_all_hits,
            max_hit_p95_ms=args.max_hit_p95_ms,
            max_hit_elapsed_ms=args.max_hit_elapsed_ms,
        )

    report_json = json.dumps(report, indent=2)
    if args.output:
        Path(args.output).write_text(report_json)
    else:
        print(report_json)

    if report["status"] != "pass":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
