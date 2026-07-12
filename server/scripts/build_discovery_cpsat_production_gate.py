"""Run the production-profile CP-SAT performance and quality gate."""

from __future__ import annotations

import argparse
import ctypes
from importlib.metadata import version
import json
import os
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.build_discovery_all_class_smoke import run_smoke_report  # noqa: E402


REPORT_VERSION = "build-discovery-cpsat-production-gate-v1"
EXPECTED_WORKERS = 2
EXPECTED_CONCURRENCY = 1
EXPECTED_CPU_COUNT = 2.0
EXPECTED_MEMORY_BYTES = 2 * 1024**3
MAX_PROCESS_RSS_BYTES = 400 * 1024**2
EXPECTED_QUALITY_ROWS = 19
EXPECTED_ORTOOLS_VERSION = "9.12.4544"
DEFAULT_MAX_WARM_MISS_P95_MS = 4000.0
DEFAULT_MAX_CACHE_HIT_P95_MS = 100.0
DEFAULT_MAX_END_TO_END_P95_MS = 5000.0


def _read_number(path: str) -> float | None:
    try:
        value = Path(path).read_text(encoding="ascii").strip()
    except (OSError, ValueError):
        return None
    if value == "max":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def observable_execution_context() -> dict[str, Any]:
    """Return effective cgroup limits when available, otherwise host observations."""
    cpu_source = "os.cpu_count"
    cpu_count = float(os.cpu_count()) if os.cpu_count() is not None else None
    try:
        quota_text = Path("/sys/fs/cgroup/cpu.max").read_text(encoding="ascii").split()
    except OSError:
        quota_text = []
    if quota_text and quota_text[0] != "max":
        try:
            cpu_count = float(quota_text[0]) / float(quota_text[1])
            cpu_source = "cgroup-v2"
        except (ValueError, IndexError, ZeroDivisionError):
            pass
    else:
        cfs_quota = _read_number("/sys/fs/cgroup/cpu/cpu.cfs_quota_us")
        cfs_period = _read_number("/sys/fs/cgroup/cpu/cpu.cfs_period_us")
        if cfs_quota is not None and cfs_period and cfs_quota > 0:
            cpu_count = cfs_quota / cfs_period
            cpu_source = "cgroup-v1"

    memory_bytes = _read_number("/sys/fs/cgroup/memory.max")
    memory_source = "cgroup-v2" if memory_bytes is not None else None
    if memory_bytes is None:
        memory_bytes = _read_number("/sys/fs/cgroup/memory/memory.limit_in_bytes")
        memory_source = "cgroup-v1" if memory_bytes is not None else None

    return {
        "cpuCount": cpu_count,
        "cpuSource": cpu_source,
        "memoryLimitBytes": int(memory_bytes) if memory_bytes is not None else None,
        "memorySource": memory_source,
    }


def process_peak_rss_bytes() -> int | None:
    if os.name == "nt":
        class ProcessMemoryCounters(ctypes.Structure):
            _fields_ = [
                ("cb", ctypes.c_ulong),
                ("PageFaultCount", ctypes.c_ulong),
                ("PeakWorkingSetSize", ctypes.c_size_t),
                ("WorkingSetSize", ctypes.c_size_t),
                ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                ("PagefileUsage", ctypes.c_size_t),
                ("PeakPagefileUsage", ctypes.c_size_t),
            ]
        counters = ProcessMemoryCounters()
        counters.cb = ctypes.sizeof(counters)
        process = ctypes.windll.kernel32.GetCurrentProcess()
        if ctypes.windll.psapi.GetProcessMemoryInfo(process, ctypes.byref(counters), counters.cb):
            return int(counters.PeakWorkingSetSize)
        return None
    try:
        import resource

        peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        return int(peak if sys.platform == "darwin" else peak * 1024)
    except (ImportError, OSError):
        return None


def smoke_args(max_miss_p95_ms: float, max_end_to_end_p95_ms: float) -> SimpleNamespace:
    return SimpleNamespace(
        target_set="all-class-level-200", target=None, skip_warmup=False,
        workers=EXPECTED_WORKERS, time_limit_seconds=2.8, candidate_limit=3,
        stop_after_candidates=False, compare_reference=False,
        reference_time_limit_seconds=12.0, reference_candidate_limit=12,
        min_reference_score_ratio=0.97,
        max_total_search_p95_ms=max_miss_p95_ms,
        max_elapsed_p95_ms=max_end_to_end_p95_ms,
    )


def run_gate(
    *,
    cache_report_fn: Callable[..., dict[str, Any]],
    max_warm_miss_p95_ms: float = DEFAULT_MAX_WARM_MISS_P95_MS,
    max_cache_hit_p95_ms: float = DEFAULT_MAX_CACHE_HIT_P95_MS,
    max_end_to_end_p95_ms: float = DEFAULT_MAX_END_TO_END_P95_MS,
    workers: int = EXPECTED_WORKERS,
    concurrency: int = EXPECTED_CONCURRENCY,
    smoke_runner: Callable[[argparse.Namespace], dict[str, Any]] = run_smoke_report,
    context_fn: Callable[[], dict[str, Any]] = observable_execution_context,
    peak_rss_fn: Callable[[], int | None] = process_peak_rss_bytes,
    ortools_version_fn: Callable[[], str] = lambda: version("ortools"),
) -> dict[str, Any]:
    failures: list[str] = []
    context = context_fn()
    if workers != EXPECTED_WORKERS:
        failures.append(f"workers must be {EXPECTED_WORKERS}, got {workers}")
    if concurrency != EXPECTED_CONCURRENCY:
        failures.append(f"concurrency must be {EXPECTED_CONCURRENCY}, got {concurrency}")
    ortools_version = ortools_version_fn()
    if ortools_version != EXPECTED_ORTOOLS_VERSION:
        failures.append(
            f"OR-Tools must be {EXPECTED_ORTOOLS_VERSION}, got {ortools_version}"
        )
    if context.get("cpuCount") is not None and context["cpuCount"] != EXPECTED_CPU_COUNT:
        failures.append(f"observable CPU limit must be 2, got {context['cpuCount']}")
    if context.get("memoryLimitBytes") is not None and context["memoryLimitBytes"] != EXPECTED_MEMORY_BYTES:
        failures.append(
            f"observable memory limit must be {EXPECTED_MEMORY_BYTES} bytes, got {context['memoryLimitBytes']}"
        )

    smoke = smoke_runner(smoke_args(max_warm_miss_p95_ms, max_end_to_end_p95_ms))
    smoke_summary = smoke["summary"]
    if smoke_summary.get("targetCount") != EXPECTED_QUALITY_ROWS or smoke_summary.get("passed") != EXPECTED_QUALITY_ROWS:
        failures.append(
            f"quality matrix must pass {EXPECTED_QUALITY_ROWS}/{EXPECTED_QUALITY_ROWS}, got "
            f"{smoke_summary.get('passed')}/{smoke_summary.get('targetCount')}"
        )
    failures.extend(smoke_summary.get("failures", []))

    cache_report_fn(require_all_hits=False)
    cache_hits = cache_report_fn(require_all_hits=True, max_hit_p95_ms=max_cache_hit_p95_ms)
    if cache_hits.get("status") != "pass":
        failures.extend(f"cache hit: {failure}" for failure in cache_hits.get("failures", []))

    peak_rss = peak_rss_fn()
    if peak_rss is not None and peak_rss > MAX_PROCESS_RSS_BYTES:
        failures.append(f"process peak RSS {peak_rss} exceeded {MAX_PROCESS_RSS_BYTES} bytes")
    return {
        "reportVersion": REPORT_VERSION,
        "status": "pass" if not failures else "fail",
        "profile": {
            "workers": workers,
            "concurrency": concurrency,
            "expectedCpuCount": EXPECTED_CPU_COUNT,
            "expectedMemoryBytes": EXPECTED_MEMORY_BYTES,
            "maxProcessRssBytes": MAX_PROCESS_RSS_BYTES,
            "ortoolsVersion": ortools_version,
        },
        "executionContext": context,
        "processPeakRssBytes": peak_rss,
        "thresholds": {
            "maxWarmCacheMissP95Ms": max_warm_miss_p95_ms,
            "maxCacheHitP95Ms": max_cache_hit_p95_ms,
            "maxEndToEndP95Ms": max_end_to_end_p95_ms,
        },
        "measurements": {
            "warmCacheMissP95Ms": smoke_summary["totalSearchMs"]["p95Ms"],
            "cacheHitP95Ms": cache_hits["summary"]["cacheHitElapsed"]["p95Ms"],
            "endToEndP95Ms": smoke_summary["elapsedMs"]["p95Ms"],
            "qualityMatrix": {
                "passed": smoke_summary.get("passed"),
                "total": smoke_summary.get("targetCount"),
            },
        },
        "failures": failures,
        "smokeReport": smoke,
        "cacheHitReport": cache_hits,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=EXPECTED_WORKERS)
    parser.add_argument("--concurrency", type=int, default=EXPECTED_CONCURRENCY)
    parser.add_argument("--max-warm-miss-p95-ms", type=float, default=DEFAULT_MAX_WARM_MISS_P95_MS)
    parser.add_argument("--max-cache-hit-p95-ms", type=float, default=DEFAULT_MAX_CACHE_HIT_P95_MS)
    parser.add_argument("--max-end-to-end-p95-ms", type=float, default=DEFAULT_MAX_END_TO_END_P95_MS)
    args = parser.parse_args()

    from app import app
    from app.schema import build_discovery_cached_response
    from scripts.build_discovery_cache_prewarm import prewarm_query_matrix

    with app.app_context():
        report = run_gate(
            cache_report_fn=lambda **kwargs: prewarm_query_matrix(build_discovery_cached_response, **kwargs),
            max_warm_miss_p95_ms=args.max_warm_miss_p95_ms,
            max_cache_hit_p95_ms=args.max_cache_hit_p95_ms,
            max_end_to_end_p95_ms=args.max_end_to_end_p95_ms,
            workers=args.workers,
            concurrency=args.concurrency,
        )
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("status", "measurements", "processPeakRssBytes", "failures")}, indent=2))
    if report["status"] != "pass":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
