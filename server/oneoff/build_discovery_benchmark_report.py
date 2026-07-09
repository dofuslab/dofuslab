"""Build Discovery benchmark report tooling.

The report is intentionally separate from the solver so benchmark review can be
run and diffed without changing search behavior.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from typing import Any, Callable, Iterable

from oneoff.build_discovery_prototype import BuildTarget
from oneoff.score_dofuslab_view import score_view, state_summary

REPORT_VERSION = "build-discovery-benchmark-report-v1"


@dataclass(frozen=True)
class BenchmarkDefinition:
    id: str
    label: str
    url: str
    target: BuildTarget
    element: str = "strength"
    source: str = "dofuslab"
    notes: str = ""


BENCHMARKS: tuple[BenchmarkDefinition, ...] = (
    BenchmarkDefinition(
        id="saone_budget_11_6_strength_iop",
        label="Saone budget 11/6 Strength Iop",
        url="https://dofuslab.io/view/da060c6e-37e2-4c7e-bee5-26d8d0718942/",
        target=BuildTarget(ap=11, mp=6, range=0),
        notes="Budget-oriented human reference from the PRD.",
    ),
    BenchmarkDefinition(
        id="strong_11_6_strength_iop",
        label="Strong 11/6 Strength Iop reference",
        url="https://dofuslab.io/view/32d509ac-462b-43ae-ae22-f5e1da4af261/",
        target=BuildTarget(ap=11, mp=6, range=0),
    ),
    BenchmarkDefinition(
        id="strong_12_ap_high_damage_strength_iop",
        label="Strong 12 AP / high-damage Strength Iop reference",
        url="https://dofuslab.io/view/5a9871c0-a1b5-41c6-bc11-c3eaae27d750/",
        target=BuildTarget(ap=12, mp=6, range=0),
    ),
    BenchmarkDefinition(
        id="strong_12_ap_strength_iop",
        label="Strong 12 AP Strength Iop reference",
        url="https://dofuslab.io/view/b52aa6ae-b61f-4fa6-99b4-3b5543ca3f6d/",
        target=BuildTarget(ap=12, mp=6, range=0),
    ),
    BenchmarkDefinition(
        id="additional_working_strength_iop",
        label="Additional working Strength Iop reference",
        url="https://dofuslab.io/view/bac3fbb9-abe3-4251-aac7-c694a887bec3/",
        target=BuildTarget(ap=12, mp=6, range=0),
    ),
)

EXTERNAL_COMPARISON_REFERENCES = (
    {
        "id": "fashionista_balanced_glass_cannon",
        "label": "Dofus Fashionista balanced/glass-cannon comparison",
        "url": "https://dofusfashionista.gg/s/str%20iop%20test/MjMxODIzlCszdQ__/",
        "source": "dofusfashionista",
        "status": "manual_comparison",
    },
    {
        "id": "fashionista_solution_comparison",
        "label": "Dofus Fashionista solution comparison",
        "url": "https://dofusfashionista.gg/solution/231823/",
        "source": "dofusfashionista",
        "status": "manual_comparison",
    },
)


def target_summary(target: BuildTarget) -> dict[str, int]:
    return {"AP": target.ap, "MP": target.mp, "Range": target.range}


def benchmark_definition_summary(benchmark: BenchmarkDefinition) -> dict[str, Any]:
    return {
        "id": benchmark.id,
        "label": benchmark.label,
        "url": benchmark.url,
        "source": benchmark.source,
        "element": benchmark.element,
        "target": target_summary(benchmark.target),
        "notes": benchmark.notes,
    }


def best_generated_build(generated_builds: Iterable[dict[str, Any]]) -> dict[str, Any] | None:
    candidates = [
        build
        for build in generated_builds
        if isinstance(build.get("score"), (int, float))
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda build: build["score"])


def generated_score_comparison(
    benchmark_score: float,
    generated_builds: Iterable[dict[str, Any]],
) -> dict[str, Any]:
    best_build = best_generated_build(generated_builds)
    if best_build is None:
        return {
            "status": "not_compared",
            "reason": "No generated build scores were provided.",
        }

    generated_score = float(best_build["score"])
    delta = round(generated_score - benchmark_score, 2)
    if delta >= 0:
        status = "generated_meets_or_beats_benchmark"
        reason = "The best generated build scores at least as high as this benchmark."
    else:
        status = "benchmark_scores_higher"
        reason = "The benchmark scores higher than the best generated build; inspect stat, availability, and approach differences."

    return {
        "status": status,
        "benchmarkScore": round(benchmark_score, 2),
        "bestGeneratedScore": round(generated_score, 2),
        "delta": delta,
        "bestGeneratedLabel": best_build.get("label"),
        "bestGeneratedId": best_build.get("id"),
        "reason": reason,
    }


def score_benchmark(
    benchmark: BenchmarkDefinition,
    scorer: Callable[[str, BuildTarget], dict[str, Any]] = score_view,
    generated_builds: Iterable[dict[str, Any]] = (),
) -> dict[str, Any]:
    scored = scorer(benchmark.url, benchmark.target)
    score_summaries = {
        key: state_summary(state)
        for key, state in scored["scores"].items()
    }
    normalized_score = score_summaries["normalizedPrototypeBase"]["score"]

    return {
        **benchmark_definition_summary(benchmark),
        "sourceBuildName": scored["name"],
        "entries": scored["entries"],
        "scores": score_summaries,
        "generatedComparison": generated_score_comparison(
            normalized_score,
            generated_builds,
        ),
    }


def benchmark_error_report(benchmark: BenchmarkDefinition, error: Exception) -> dict[str, Any]:
    return {
        **benchmark_definition_summary(benchmark),
        "status": "error",
        "error": {
            "type": type(error).__name__,
            "message": str(error),
        },
        "generatedComparison": {
            "status": "not_compared",
            "reason": "Benchmark scoring failed.",
        },
    }


def build_report(
    benchmarks: Iterable[BenchmarkDefinition] = BENCHMARKS,
    scorer: Callable[[str, BuildTarget], dict[str, Any]] = score_view,
    generated_results: dict[str, Any] | None = None,
    allow_errors: bool = False,
) -> dict[str, Any]:
    generated_builds = (generated_results or {}).get("builds", [])
    benchmark_reports = []
    for benchmark in benchmarks:
        try:
            benchmark_reports.append(score_benchmark(benchmark, scorer, generated_builds))
        except Exception as error:
            if not allow_errors:
                raise
            benchmark_reports.append(benchmark_error_report(benchmark, error))

    return {
        "reportVersion": REPORT_VERSION,
        "benchmarkCount": len(benchmark_reports),
        "errorCount": sum(1 for report in benchmark_reports if report.get("status") == "error"),
        "benchmarks": benchmark_reports,
        "externalComparisonReferences": list(EXTERNAL_COMPARISON_REFERENCES),
    }


def load_generated_results(path: str | None) -> dict[str, Any] | None:
    if path is None:
        return None
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--generated-results",
        help="Optional JSON output from oneoff.build_discovery_prototype for generated-vs-benchmark comparison.",
    )
    parser.add_argument("--output", help="Write report JSON to this path instead of stdout.")
    parser.add_argument(
        "--allow-errors",
        action="store_true",
        help="Include per-benchmark error entries instead of aborting on the first scoring failure.",
    )
    args = parser.parse_args()

    report = build_report(
        generated_results=load_generated_results(args.generated_results),
        allow_errors=args.allow_errors,
    )
    output = json.dumps(report, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(output)
            file.write("\n")
    else:
        print(output)


if __name__ == "__main__":
    main()
