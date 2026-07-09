"""Summarize local Build Discovery readiness evidence."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prod_benchmark_discovery import preflight_status  # noqa: E402
from scripts.check_build_discovery_benchmark_comparison import (  # noqa: E402
    DEFAULT_FIXTURE_PATH,
    load_json,
    validate_report,
)
from scripts.build_discovery_prod_benchmark_review_packet import (  # noqa: E402
    REPORT_VERSION as PROD_REVIEW_PACKET_VERSION,
)

REPORT_VERSION = "build-discovery-local-readiness-report-v1"
PROD_REVIEW_PACKET_FORBIDDEN_KEYS = {
    "customSetId",
    "custom_set_id",
    "customSetName",
    "custom_set_name",
    "customSetUuid",
    "custom_set_uuid",
    "owner",
    "ownerId",
    "owner_id",
    "ownerUuid",
    "owner_uuid",
    "userId",
    "user_id",
    "userUuid",
    "user_uuid",
}


def find_repo_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if (candidate / ".codex" / "state").exists():
            return candidate
    for candidate in (start, *start.parents):
        if (candidate / "app").exists() and (candidate / "scripts").exists():
            return candidate
    return start


REPO_ROOT = find_repo_root(Path(__file__).resolve())
DEFAULT_READINESS_CHECKLIST = REPO_ROOT / ".codex" / "state" / "build-discovery-readiness-checklist.md"
DEFAULT_GAMEPLAY_REVIEW_PACKET = REPO_ROOT / ".codex" / "state" / "build-discovery-gameplay-review-packet.md"
DEFAULT_ASSUMPTIONS_LEDGER = REPO_ROOT / ".codex" / "state" / "build-discovery-assumptions.md"
DEFAULT_ASSUMPTIONS_REVIEW_INDEX = (
    REPO_ROOT / ".codex" / "state" / "build-discovery-assumptions-review-index.md"
)


def checklist_open_items(path: Path) -> list[str]:
    if not path.exists():
        return [f"missing checklist: {path}"]
    return [
        line[6:].strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("- [ ] ")
    ]


def markdown_bullet_count(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(
        1
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("- ")
    )


def markdown_section_count(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(
        1
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("## ")
    )


def review_question_count(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(
        1
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("- ") and "?" in line
    )


def numbered_items_in_section(path: Path, section_heading: str) -> int:
    if not path.exists():
        return 0
    in_section = False
    count = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            in_section = line.strip() == section_heading
            continue
        if in_section and line[:1].isdigit() and ". " in line[:4]:
            count += 1
    return count


def assumptions_review_status(
    assumptions_ledger_path: Path,
    gameplay_review_packet_path: Path,
    assumptions_review_index_path: Path,
) -> dict[str, Any]:
    return {
        "ledgerPath": str(assumptions_ledger_path),
        "ledgerExists": assumptions_ledger_path.exists(),
        "ledgerSectionCount": markdown_section_count(assumptions_ledger_path),
        "ledgerAssumptionCount": markdown_bullet_count(assumptions_ledger_path),
        "gameplayReviewQuestionCount": review_question_count(gameplay_review_packet_path),
        "reviewIndex": {
            "path": str(assumptions_review_index_path),
            "exists": assumptions_review_index_path.exists(),
            "releaseBlockerCount": numbered_items_in_section(
                assumptions_review_index_path,
                "## Release Blockers",
            ),
            "watchItemCount": numbered_items_in_section(
                assumptions_review_index_path,
                "## Shippability Watch Items",
            ),
        },
    }


def cache_report_status(path: Path | None, max_cache_hit_p95_ms: float) -> dict[str, Any]:
    if path is None:
        return {
            "status": "not_checked",
            "reason": "no cache prewarm report path provided",
        }
    if not path.exists():
        return {
            "status": "missing",
            "path": str(path),
        }
    report = load_json(path)
    cache_hit_elapsed = report.get("summary", {}).get("cacheHitElapsed", {})
    cache_hit_p95 = cache_hit_elapsed.get("p95Ms")
    failures = []
    if report.get("status") != "pass":
        failures.append("cache prewarm report status is not pass")
    if report.get("summary", {}).get("cacheMisses") != 0:
        failures.append("cache prewarm report includes cache misses")
    if report.get("summary", {}).get("emptyResults") != 0:
        failures.append("cache prewarm report includes empty results")
    if not isinstance(cache_hit_p95, (int, float)) or cache_hit_p95 > max_cache_hit_p95_ms:
        failures.append("cache-hit p95 is missing or above threshold")

    return {
        "status": "pass" if not failures else "fail",
        "path": str(path),
        "failures": failures,
        "summary": report.get("summary", {}),
        "maxCacheHitP95Ms": max_cache_hit_p95_ms,
    }


def benchmark_report_status(path: Path | None, fixture_path: Path) -> dict[str, Any]:
    if path is None:
        return {
            "status": "not_checked",
            "reason": "no benchmark comparison report path provided",
        }
    if not path.exists():
        return {
            "status": "missing",
            "path": str(path),
        }
    failures = validate_report(load_json(path), load_json(fixture_path))
    return {
        "status": "pass" if not failures else "fail",
        "path": str(path),
        "fixturePath": str(fixture_path),
        "failures": failures,
    }


def forbidden_keys_in_json(value: Any) -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        for key, nested_value in value.items():
            if key in PROD_REVIEW_PACKET_FORBIDDEN_KEYS:
                found.append(key)
            found.extend(forbidden_keys_in_json(nested_value))
    elif isinstance(value, list):
        for item in value:
            found.extend(forbidden_keys_in_json(item))
    return found


def prod_review_packet_status(path: Path | None) -> dict[str, Any]:
    if path is None:
        return {
            "status": "not_checked",
            "reason": "no prod benchmark review packet path provided",
        }
    if not path.exists():
        return {
            "status": "missing",
            "path": str(path),
        }

    packet = load_json(path)
    failures = []
    if packet.get("reportVersion") != PROD_REVIEW_PACKET_VERSION:
        failures.append("prod benchmark review packet reportVersion is unexpected")
    for field in ("supportedGeneratedBenchmarkPrompts", "futureBenchmarkPrompts"):
        if not isinstance(packet.get(field), list):
            failures.append(f"prod benchmark review packet {field} is missing or not a list")
    forbidden_keys = sorted(set(forbidden_keys_in_json(packet)))
    if forbidden_keys:
        failures.append(
            "prod benchmark review packet includes forbidden identifier keys: "
            + ", ".join(forbidden_keys)
        )

    return {
        "status": "pass" if not failures else "fail",
        "path": str(path),
        "failures": failures,
        "supportedPromptCount": len(packet.get("supportedGeneratedBenchmarkPrompts", []))
        if isinstance(packet.get("supportedGeneratedBenchmarkPrompts"), list)
        else 0,
        "futurePromptCount": len(packet.get("futureBenchmarkPrompts", []))
        if isinstance(packet.get("futureBenchmarkPrompts"), list)
        else 0,
    }


def build_readiness_report(
    readiness_checklist_path: Path = DEFAULT_READINESS_CHECKLIST,
    gameplay_review_packet_path: Path = DEFAULT_GAMEPLAY_REVIEW_PACKET,
    assumptions_ledger_path: Path = DEFAULT_ASSUMPTIONS_LEDGER,
    assumptions_review_index_path: Path = DEFAULT_ASSUMPTIONS_REVIEW_INDEX,
    cache_prewarm_report_path: Path | None = None,
    benchmark_comparison_report_path: Path | None = None,
    prod_benchmark_review_packet_path: Path | None = None,
    benchmark_fixture_path: Path = DEFAULT_FIXTURE_PATH,
    max_cache_hit_p95_ms: float = 500.0,
) -> dict[str, Any]:
    open_items = checklist_open_items(readiness_checklist_path)
    prod_preflight = preflight_status()
    cache_status = cache_report_status(cache_prewarm_report_path, max_cache_hit_p95_ms)
    benchmark_status = benchmark_report_status(benchmark_comparison_report_path, benchmark_fixture_path)
    prod_review_packet = prod_review_packet_status(prod_benchmark_review_packet_path)
    assumptions_status = assumptions_review_status(
        assumptions_ledger_path,
        gameplay_review_packet_path,
        assumptions_review_index_path,
    )
    gameplay_packet_exists = gameplay_review_packet_path.exists()
    blockers = list(open_items)
    if not gameplay_packet_exists:
        blockers.append(f"missing gameplay review packet: {gameplay_review_packet_path}")
    if not assumptions_status["ledgerExists"]:
        blockers.append(f"missing assumptions ledger: {assumptions_ledger_path}")
    if not assumptions_status["reviewIndex"]["exists"]:
        blockers.append(f"missing assumptions review index: {assumptions_review_index_path}")
    if not prod_preflight["environment"]["readonlyDatabaseUrlPresent"]:
        blockers.append("prod readonly database URL is not available")
    if cache_status["status"] in {"fail", "missing"}:
        blockers.append(f"cache prewarm validation is {cache_status['status']}")
    if benchmark_status["status"] in {"fail", "missing"}:
        blockers.append(f"benchmark comparison validation is {benchmark_status['status']}")
    if prod_review_packet["status"] in {"fail", "missing"}:
        blockers.append(
            f"prod benchmark review packet validation is {prod_review_packet['status']}"
        )

    return {
        "reportVersion": REPORT_VERSION,
        "status": "pass" if not blockers else "incomplete",
        "readinessChecklist": {
            "path": str(readiness_checklist_path),
            "openItemCount": len(open_items),
            "openItems": open_items,
        },
        "gameplayReviewPacket": {
            "path": str(gameplay_review_packet_path),
            "exists": gameplay_packet_exists,
        },
        "assumptionsReview": assumptions_status,
        "cachePrewarm": cache_status,
        "benchmarkComparison": benchmark_status,
        "prodBenchmarkReviewPacket": prod_review_packet,
        "prodPreflight": prod_preflight,
        "blockers": blockers,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--readiness-checklist", type=Path, default=DEFAULT_READINESS_CHECKLIST)
    parser.add_argument("--gameplay-review-packet", type=Path, default=DEFAULT_GAMEPLAY_REVIEW_PACKET)
    parser.add_argument("--assumptions-ledger", type=Path, default=DEFAULT_ASSUMPTIONS_LEDGER)
    parser.add_argument(
        "--assumptions-review-index",
        type=Path,
        default=DEFAULT_ASSUMPTIONS_REVIEW_INDEX,
    )
    parser.add_argument("--cache-prewarm-report", type=Path)
    parser.add_argument("--benchmark-comparison-report", type=Path)
    parser.add_argument("--prod-benchmark-review-packet", type=Path)
    parser.add_argument("--benchmark-fixture", type=Path, default=DEFAULT_FIXTURE_PATH)
    parser.add_argument("--max-cache-hit-p95-ms", type=float, default=500.0)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    report = build_readiness_report(
        readiness_checklist_path=args.readiness_checklist,
        gameplay_review_packet_path=args.gameplay_review_packet,
        assumptions_ledger_path=args.assumptions_ledger,
        assumptions_review_index_path=args.assumptions_review_index,
        cache_prewarm_report_path=args.cache_prewarm_report,
        benchmark_comparison_report_path=args.benchmark_comparison_report,
        prod_benchmark_review_packet_path=args.prod_benchmark_review_packet,
        benchmark_fixture_path=args.benchmark_fixture,
        max_cache_hit_p95_ms=args.max_cache_hit_p95_ms,
    )
    output = json.dumps(report, indent=2, ensure_ascii=False)
    if args.output:
        args.output.write_text(output + "\n", encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()
