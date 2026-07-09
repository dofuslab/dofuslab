from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import replace
from pathlib import Path
from typing import Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app  # noqa: E402
from app.schema import build_discovery_cached_response  # noqa: E402
from oneoff.build_discovery_query_perf import (  # noqa: E402
    LOCAL_VALIDATION_SUITE_PROFILES,
    SUPPORTED_IOP_ELEMENTS,
)
from oneoff.build_discovery_prototype import BuildDiscoveryQuery  # noqa: E402


REPORT_VERSION = "build-discovery-cache-prewarm-v1"


def prewarm_query_matrix(
    prewarm_fn: Callable[[BuildDiscoveryQuery], dict],
    elements: tuple[str, ...] = SUPPORTED_IOP_ELEMENTS,
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

    return {
        "reportVersion": REPORT_VERSION,
        "status": "pass" if all(row["resultCount"] > 0 for row in rows) else "fail",
        "rows": rows,
        "summary": {
            "rowCount": len(rows),
            "cacheHits": sum(1 for row in rows if row["appCacheHit"]),
            "cacheMisses": sum(1 for row in rows if not row["appCacheHit"]),
            "emptyResults": sum(1 for row in rows if row["resultCount"] <= 0),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        help="Optional path for writing the prewarm report JSON.",
    )
    args = parser.parse_args()

    with app.app_context():
        report = prewarm_query_matrix(build_discovery_cached_response)

    report_json = json.dumps(report, indent=2)
    if args.output:
        Path(args.output).write_text(report_json)
    else:
        print(report_json)

    if report["status"] != "pass":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
