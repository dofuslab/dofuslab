"""Run local Build Discovery readiness evidence collection."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.build_discovery_local_readiness_report import (  # noqa: E402
    DEFAULT_ASSUMPTIONS_LEDGER,
    DEFAULT_GAMEPLAY_REVIEW_PACKET,
    DEFAULT_READINESS_CHECKLIST,
    build_readiness_report,
)

REPORT_VERSION = "build-discovery-local-readiness-pipeline-v1"
WARM_CACHE_FILENAME = "cache_prewarm_warm.json"
STRICT_CACHE_FILENAME = "cache_prewarm_strict.json"
READINESS_FILENAME = "local_readiness_report.json"
SUMMARY_FILENAME = "local_readiness_pipeline_summary.json"


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        file.write(json.dumps(payload, indent=2, ensure_ascii=False))
        file.write("\n")


def default_cache_prewarm_report(
    require_all_hits: bool,
    max_hit_p95_ms: float | None,
    max_hit_elapsed_ms: float | None,
) -> dict[str, Any]:
    from app import app
    from app.schema import build_discovery_cached_response
    from scripts.build_discovery_cache_prewarm import prewarm_query_matrix

    with app.app_context():
        return prewarm_query_matrix(
            build_discovery_cached_response,
            require_all_hits=require_all_hits,
            max_hit_p95_ms=max_hit_p95_ms,
            max_hit_elapsed_ms=max_hit_elapsed_ms,
        )


def build_summary(
    warm_cache_report: dict[str, Any],
    strict_cache_report: dict[str, Any],
    readiness_report: dict[str, Any],
    output_dir: Path,
) -> dict[str, Any]:
    return {
        "reportVersion": REPORT_VERSION,
        "artifacts": {
            "warmCachePrewarmReport": str(output_dir / WARM_CACHE_FILENAME),
            "strictCachePrewarmReport": str(output_dir / STRICT_CACHE_FILENAME),
            "readinessReport": str(output_dir / READINESS_FILENAME),
        },
        "warmCacheStatus": warm_cache_report.get("status"),
        "strictCacheStatus": strict_cache_report.get("status"),
        "strictCacheSummary": strict_cache_report.get("summary", {}),
        "readinessStatus": readiness_report.get("status"),
        "assumptionsReview": readiness_report.get("assumptionsReview", {}),
        "blockers": readiness_report.get("blockers", []),
    }


def run_pipeline(
    output_dir: str | Path,
    max_hit_p95_ms: float = 500.0,
    max_hit_elapsed_ms: float = 500.0,
    readiness_checklist_path: Path = DEFAULT_READINESS_CHECKLIST,
    gameplay_review_packet_path: Path = DEFAULT_GAMEPLAY_REVIEW_PACKET,
    assumptions_ledger_path: Path = DEFAULT_ASSUMPTIONS_LEDGER,
    cache_prewarm_fn: Callable[[bool, float | None, float | None], dict[str, Any]] = default_cache_prewarm_report,
    readiness_fn: Callable[..., dict[str, Any]] = build_readiness_report,
) -> dict[str, Any]:
    output_path = Path(output_dir)
    warm_cache_report = cache_prewarm_fn(False, None, None)
    strict_cache_report = cache_prewarm_fn(True, max_hit_p95_ms, max_hit_elapsed_ms)

    warm_cache_path = output_path / WARM_CACHE_FILENAME
    strict_cache_path = output_path / STRICT_CACHE_FILENAME
    readiness_path = output_path / READINESS_FILENAME

    write_json(warm_cache_path, warm_cache_report)
    write_json(strict_cache_path, strict_cache_report)

    readiness_report = readiness_fn(
        readiness_checklist_path=readiness_checklist_path,
        gameplay_review_packet_path=gameplay_review_packet_path,
        assumptions_ledger_path=assumptions_ledger_path,
        cache_prewarm_report_path=strict_cache_path,
        max_cache_hit_p95_ms=max_hit_p95_ms,
    )
    summary = build_summary(
        warm_cache_report,
        strict_cache_report,
        readiness_report,
        output_path,
    )

    write_json(readiness_path, readiness_report)
    write_json(output_path / SUMMARY_FILENAME, summary)
    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="/tmp/build_discovery_local_readiness_pipeline")
    parser.add_argument("--max-hit-p95-ms", type=float, default=500.0)
    parser.add_argument("--max-hit-elapsed-ms", type=float, default=500.0)
    parser.add_argument("--readiness-checklist", type=Path, default=DEFAULT_READINESS_CHECKLIST)
    parser.add_argument("--gameplay-review-packet", type=Path, default=DEFAULT_GAMEPLAY_REVIEW_PACKET)
    parser.add_argument("--assumptions-ledger", type=Path, default=DEFAULT_ASSUMPTIONS_LEDGER)
    args = parser.parse_args()

    summary = run_pipeline(
        output_dir=args.output_dir,
        max_hit_p95_ms=args.max_hit_p95_ms,
        max_hit_elapsed_ms=args.max_hit_elapsed_ms,
        readiness_checklist_path=args.readiness_checklist,
        gameplay_review_packet_path=args.gameplay_review_packet,
        assumptions_ledger_path=args.assumptions_ledger,
    )
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
