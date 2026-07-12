"""Run local Build Discovery readiness evidence collection."""

from __future__ import annotations

import argparse
import json
import sys
from types import SimpleNamespace
from pathlib import Path
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    DEFAULT_MAX_SHARED_ITEMS,
    GENERIC_DAMAGE_WEIGHT,
    WEAPON_DAMAGE_WEIGHT,
)
from oneoff.build_discovery_benchmark_report import build_report  # noqa: E402
from scripts.build_discovery_benchmark_generated_results import (  # noqa: E402
    build_generated_results,
)
from scripts.check_build_discovery_benchmark_comparison import (  # noqa: E402
    DEFAULT_FIXTURE_PATH,
    validate_report,
)
from scripts.build_discovery_local_readiness_report import (  # noqa: E402
    DEFAULT_ASSUMPTIONS_LEDGER,
    DEFAULT_ASSUMPTIONS_REVIEW_INDEX,
    DEFAULT_GAMEPLAY_REVIEW_PACKET,
    DEFAULT_READINESS_CHECKLIST,
    build_readiness_report,
)

REPORT_VERSION = "build-discovery-local-readiness-pipeline-v1"
WARM_CACHE_FILENAME = "cache_prewarm_warm.json"
STRICT_CACHE_FILENAME = "cache_prewarm_strict.json"
BENCHMARK_GENERATED_RESULTS_FILENAME = "benchmark_generated_results.json"
BENCHMARK_COMPARISON_FILENAME = "benchmark_comparison_report.json"
CPSAT_QUALITY_GATE_FILENAME = "cpsat_quality_gate.json"
READINESS_FILENAME = "local_readiness_report.json"
SUMMARY_FILENAME = "local_readiness_pipeline_summary.json"
READINESS_CHECKLIST_FILENAME = "build-discovery-readiness-checklist.md"
GAMEPLAY_REVIEW_PACKET_FILENAME = "build-discovery-gameplay-review-packet.md"
ASSUMPTIONS_LEDGER_FILENAME = "build-discovery-assumptions.md"
ASSUMPTIONS_REVIEW_INDEX_FILENAME = "build-discovery-assumptions-review-index.md"


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        file.write(json.dumps(payload, indent=2, ensure_ascii=False))
        file.write("\n")


def state_paths_from_dir(state_dir: Path) -> dict[str, Path]:
    return {
        "readiness_checklist_path": state_dir / READINESS_CHECKLIST_FILENAME,
        "gameplay_review_packet_path": state_dir / GAMEPLAY_REVIEW_PACKET_FILENAME,
        "assumptions_ledger_path": state_dir / ASSUMPTIONS_LEDGER_FILENAME,
        "assumptions_review_index_path": state_dir / ASSUMPTIONS_REVIEW_INDEX_FILENAME,
    }


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


def default_benchmark_generated_results() -> dict[str, Any]:
    return build_generated_results(
        SimpleNamespace(
            limit=5,
            top_k=25,
            beam_width=250,
            per_signature_cap=40,
            relevant_set_limit=60,
            budget_tier=4,
            exo_policy="opti",
            max_shared_items=DEFAULT_MAX_SHARED_ITEMS,
            generic_damage_weight=GENERIC_DAMAGE_WEIGHT,
            weapon_damage_weight=WEAPON_DAMAGE_WEIGHT,
        )
    )


def default_benchmark_comparison_report(
    generated_results: dict[str, Any],
) -> dict[str, Any]:
    return build_report(
        generated_results=generated_results,
        allow_errors=True,
    )


def smoke_args(**overrides: Any) -> SimpleNamespace:
    defaults = {
        "time_limit_seconds": 3.2,
        "workers": 8,
        "candidate_limit": 3,
        "stop_after_candidates": False,
        "compare_reference": False,
        "reference_time_limit_seconds": 8.0,
        "reference_candidate_limit": 8,
        "min_reference_score_ratio": 0.97,
        "skip_warmup": False,
        "max_total_search_p95_ms": 5000.0,
        "max_elapsed_p95_ms": 5000.0,
        "target": None,
    }
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def default_cpsat_quality_gate_report() -> dict[str, Any]:
    from scripts.build_discovery_all_class_smoke import run_smoke_report

    reports = {
        "allClassLevel200": run_smoke_report(smoke_args(target_set="all-class-level-200")),
        "levelDiversity": run_smoke_report(smoke_args(target_set="level-diversity")),
        "referenceComparison": run_smoke_report(
            smoke_args(
                target_set="all-class-level-200",
                target=["trusted_iop_strength_opti_damage", "rogue_intelligence_range6"],
                compare_reference=True,
            )
        ),
    }
    failures = [
        report_id
        for report_id, report in reports.items()
        if report.get("summary", {}).get("failed", 0)
        or report.get("summary", {}).get("failures")
    ]
    return {
        "reportVersion": "build-discovery-cpsat-quality-gate-v1",
        "status": "fail" if failures else "pass",
        "failures": failures,
        "reports": reports,
    }


def build_summary(
    warm_cache_report: dict[str, Any],
    strict_cache_report: dict[str, Any],
    benchmark_generated_results: dict[str, Any] | None,
    benchmark_comparison_report: dict[str, Any] | None,
    benchmark_validation_failures: list[str],
    cpsat_quality_gate_report: dict[str, Any] | None,
    readiness_report: dict[str, Any],
    output_dir: Path,
) -> dict[str, Any]:
    blockers = list(readiness_report.get("blockers", []))
    if cpsat_quality_gate_report and cpsat_quality_gate_report.get("status") == "fail":
        blockers.append("CP-SAT quality gate is fail")
    return {
        "reportVersion": REPORT_VERSION,
        "artifacts": {
            "warmCachePrewarmReport": str(output_dir / WARM_CACHE_FILENAME),
            "strictCachePrewarmReport": str(output_dir / STRICT_CACHE_FILENAME),
            "benchmarkGeneratedResults": None
            if benchmark_generated_results is None
            else str(output_dir / BENCHMARK_GENERATED_RESULTS_FILENAME),
            "benchmarkComparisonReport": None
            if benchmark_comparison_report is None
            else str(output_dir / BENCHMARK_COMPARISON_FILENAME),
            "cpsatQualityGateReport": None
            if cpsat_quality_gate_report is None
            else str(output_dir / CPSAT_QUALITY_GATE_FILENAME),
            "readinessReport": str(output_dir / READINESS_FILENAME),
        },
        "warmCacheStatus": warm_cache_report.get("status"),
        "strictCacheStatus": strict_cache_report.get("status"),
        "strictCacheSummary": strict_cache_report.get("summary", {}),
        "benchmarkGeneratedStatus": "not_checked"
        if benchmark_generated_results is None
        else "pass",
        "benchmarkComparisonStatus": "not_checked"
        if benchmark_comparison_report is None
        else "pass" if not benchmark_validation_failures else "fail",
        "benchmarkValidationFailures": benchmark_validation_failures,
        "cpsatQualityGateStatus": "not_checked"
        if cpsat_quality_gate_report is None
        else cpsat_quality_gate_report.get("status"),
        "prodBenchmarkReviewPacket": readiness_report.get(
            "prodBenchmarkReviewPacket",
            {"status": "not_checked"},
        ),
        "readinessStatus": readiness_report.get("status"),
        "assumptionsReview": readiness_report.get("assumptionsReview", {}),
        "blockers": blockers,
    }


def run_pipeline(
    output_dir: str | Path,
    max_hit_p95_ms: float = 500.0,
    max_hit_elapsed_ms: float = 500.0,
    readiness_checklist_path: Path = DEFAULT_READINESS_CHECKLIST,
    gameplay_review_packet_path: Path = DEFAULT_GAMEPLAY_REVIEW_PACKET,
    assumptions_ledger_path: Path = DEFAULT_ASSUMPTIONS_LEDGER,
    assumptions_review_index_path: Path = DEFAULT_ASSUMPTIONS_REVIEW_INDEX,
    prod_benchmark_review_packet_path: Path | None = None,
    benchmark_fixture_path: Path = DEFAULT_FIXTURE_PATH,
    include_benchmark_comparison: bool = True,
    include_cpsat_quality_gate: bool = True,
    cache_prewarm_fn: Callable[[bool, float | None, float | None], dict[str, Any]] = default_cache_prewarm_report,
    benchmark_generated_results_fn: Callable[[], dict[str, Any]] = default_benchmark_generated_results,
    benchmark_comparison_report_fn: Callable[[dict[str, Any]], dict[str, Any]] = default_benchmark_comparison_report,
    cpsat_quality_gate_fn: Callable[[], dict[str, Any]] = default_cpsat_quality_gate_report,
    readiness_fn: Callable[..., dict[str, Any]] = build_readiness_report,
) -> dict[str, Any]:
    output_path = Path(output_dir)
    warm_cache_report = cache_prewarm_fn(False, None, None)
    strict_cache_report = cache_prewarm_fn(True, max_hit_p95_ms, max_hit_elapsed_ms)

    warm_cache_path = output_path / WARM_CACHE_FILENAME
    strict_cache_path = output_path / STRICT_CACHE_FILENAME
    benchmark_generated_path = output_path / BENCHMARK_GENERATED_RESULTS_FILENAME
    benchmark_comparison_path = output_path / BENCHMARK_COMPARISON_FILENAME
    cpsat_quality_gate_path = output_path / CPSAT_QUALITY_GATE_FILENAME
    readiness_path = output_path / READINESS_FILENAME

    write_json(warm_cache_path, warm_cache_report)
    write_json(strict_cache_path, strict_cache_report)

    benchmark_generated_results = None
    benchmark_comparison_report = None
    benchmark_validation_failures: list[str] = []
    if include_benchmark_comparison:
        benchmark_generated_results = benchmark_generated_results_fn()
        benchmark_comparison_report = benchmark_comparison_report_fn(
            benchmark_generated_results,
        )
        benchmark_validation_failures = validate_report(
            benchmark_comparison_report,
            json.loads(benchmark_fixture_path.read_text(encoding="utf-8")),
        )
        write_json(benchmark_generated_path, benchmark_generated_results)
        write_json(benchmark_comparison_path, benchmark_comparison_report)

    cpsat_quality_gate_report = None
    if include_cpsat_quality_gate:
        cpsat_quality_gate_report = cpsat_quality_gate_fn()
        write_json(cpsat_quality_gate_path, cpsat_quality_gate_report)

    readiness_report = readiness_fn(
        readiness_checklist_path=readiness_checklist_path,
        gameplay_review_packet_path=gameplay_review_packet_path,
        assumptions_ledger_path=assumptions_ledger_path,
        assumptions_review_index_path=assumptions_review_index_path,
        cache_prewarm_report_path=strict_cache_path,
        benchmark_comparison_report_path=benchmark_comparison_path
        if include_benchmark_comparison
        else None,
        prod_benchmark_review_packet_path=prod_benchmark_review_packet_path,
        benchmark_fixture_path=benchmark_fixture_path,
        max_cache_hit_p95_ms=max_hit_p95_ms,
    )
    summary = build_summary(
        warm_cache_report,
        strict_cache_report,
        benchmark_generated_results,
        benchmark_comparison_report,
        benchmark_validation_failures,
        cpsat_quality_gate_report,
        readiness_report,
        output_path,
    )

    write_json(readiness_path, readiness_report)
    write_json(output_path / SUMMARY_FILENAME, summary)
    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="/tmp/build_discovery_local_readiness_pipeline")
    parser.add_argument(
        "--state-dir",
        type=Path,
        help=(
            "Directory containing build-discovery-readiness-checklist.md, "
            "build-discovery-gameplay-review-packet.md, build-discovery-assumptions.md, "
            "and build-discovery-assumptions-review-index.md. "
            "Explicit file path flags override this directory."
        ),
    )
    parser.add_argument("--max-hit-p95-ms", type=float, default=500.0)
    parser.add_argument("--max-hit-elapsed-ms", type=float, default=500.0)
    parser.add_argument("--readiness-checklist", type=Path)
    parser.add_argument("--gameplay-review-packet", type=Path)
    parser.add_argument("--assumptions-ledger", type=Path)
    parser.add_argument("--assumptions-review-index", type=Path)
    parser.add_argument("--prod-benchmark-review-packet", type=Path)
    parser.add_argument("--benchmark-fixture", type=Path, default=DEFAULT_FIXTURE_PATH)
    parser.add_argument(
        "--skip-benchmark-comparison",
        action="store_true",
        help="Skip local benchmark generated-result and comparison artifacts.",
    )
    parser.add_argument(
        "--skip-cpsat-quality-gate",
        action="store_true",
        help="Skip CP-SAT p95 and reference-quality gate artifacts.",
    )
    args = parser.parse_args()
    state_paths = state_paths_from_dir(args.state_dir) if args.state_dir else {}

    summary = run_pipeline(
        output_dir=args.output_dir,
        max_hit_p95_ms=args.max_hit_p95_ms,
        max_hit_elapsed_ms=args.max_hit_elapsed_ms,
        readiness_checklist_path=args.readiness_checklist
        or state_paths.get("readiness_checklist_path", DEFAULT_READINESS_CHECKLIST),
        gameplay_review_packet_path=args.gameplay_review_packet
        or state_paths.get("gameplay_review_packet_path", DEFAULT_GAMEPLAY_REVIEW_PACKET),
        assumptions_ledger_path=args.assumptions_ledger
        or state_paths.get("assumptions_ledger_path", DEFAULT_ASSUMPTIONS_LEDGER),
        assumptions_review_index_path=args.assumptions_review_index
        or state_paths.get("assumptions_review_index_path", DEFAULT_ASSUMPTIONS_REVIEW_INDEX),
        prod_benchmark_review_packet_path=args.prod_benchmark_review_packet,
        benchmark_fixture_path=args.benchmark_fixture,
        include_benchmark_comparison=not args.skip_benchmark_comparison,
        include_cpsat_quality_gate=not args.skip_cpsat_quality_gate,
    )
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
