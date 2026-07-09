import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from build_discovery_local_readiness_report import (
    assumptions_review_status,
    benchmark_report_status,
    build_readiness_report,
    cache_report_status,
    checklist_open_items,
    find_repo_root,
    numbered_items_in_section,
    prod_review_packet_status,
)


class BuildDiscoveryLocalReadinessReportTest(unittest.TestCase):
    def test_find_repo_root_walks_up_to_codex_state(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir) / "repo"
            nested = root / "server" / "scripts"
            (root / ".codex" / "state").mkdir(parents=True)
            nested.mkdir(parents=True)

            self.assertEqual(find_repo_root(nested / "script.py"), root)

    def test_find_repo_root_prefers_codex_state_over_server_markers(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir) / "repo"
            server = root / "server"
            nested = server / "scripts"
            (root / ".codex" / "state").mkdir(parents=True)
            (server / "app").mkdir(parents=True)
            nested.mkdir(parents=True)

            self.assertEqual(find_repo_root(nested / "script.py"), root)

    def test_checklist_open_items_extracts_unchecked_lines(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "checklist.md"
            path.write_text("- [x] Done\n- [ ] Needs review\n", encoding="utf-8")

            self.assertEqual(checklist_open_items(path), ["Needs review"])

    def test_assumptions_review_status_counts_ledger_and_review_questions(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            ledger_path = Path(temp_dir) / "assumptions.md"
            gameplay_path = Path(temp_dir) / "gameplay.md"
            index_path = Path(temp_dir) / "review-index.md"
            ledger_path.write_text(
                "## Budget\n- Budget assumption\n## Classes\n- Class assumption\n",
                encoding="utf-8",
            )
            gameplay_path.write_text(
                "- Should this be reviewed?\n- This is context.\n",
                encoding="utf-8",
            )
            index_path.write_text(
                (
                    "## Release Blockers\n"
                    "1. Budget\n"
                    "2. Exos\n"
                    "## Shippability Watch Items\n"
                    "1. Performance\n"
                ),
                encoding="utf-8",
            )

            status = assumptions_review_status(ledger_path, gameplay_path, index_path)

            self.assertTrue(status["ledgerExists"])
            self.assertEqual(status["ledgerSectionCount"], 2)
            self.assertEqual(status["ledgerAssumptionCount"], 2)
            self.assertEqual(status["gameplayReviewQuestionCount"], 1)
            self.assertTrue(status["reviewIndex"]["exists"])
            self.assertEqual(status["reviewIndex"]["releaseBlockerCount"], 2)
            self.assertEqual(status["reviewIndex"]["watchItemCount"], 1)

    def test_numbered_items_in_section_ignores_other_sections(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "index.md"
            path.write_text(
                (
                    "## Release Blockers\n"
                    "1. Budget\n"
                    "2. Exos\n"
                    "## Other Section\n"
                    "1. Not counted\n"
                ),
                encoding="utf-8",
            )

            self.assertEqual(numbered_items_in_section(path, "## Release Blockers"), 2)

    def test_cache_report_status_passes_strict_warmed_cache_report(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "cache.json"
            path.write_text(
                json.dumps(
                    {
                        "status": "pass",
                        "summary": {
                            "cacheMisses": 0,
                            "emptyResults": 0,
                            "cacheHitElapsed": {"p95Ms": 100.0},
                        },
                    }
                ),
                encoding="utf-8",
            )

            status = cache_report_status(path, max_cache_hit_p95_ms=500)

            self.assertEqual(status["status"], "pass")
            self.assertEqual(status["failures"], [])

    def test_cache_report_status_fails_missing_or_slow_p95(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "cache.json"
            path.write_text(
                json.dumps(
                    {
                        "status": "pass",
                        "summary": {
                            "cacheMisses": 0,
                            "emptyResults": 0,
                            "cacheHitElapsed": {"p95Ms": 600.0},
                        },
                    }
                ),
                encoding="utf-8",
            )

            status = cache_report_status(path, max_cache_hit_p95_ms=500)

            self.assertEqual(status["status"], "fail")
            self.assertIn("p95", status["failures"][0])

    def test_benchmark_report_status_uses_fixture_validator(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            report_path = Path(temp_dir) / "report.json"
            fixture_path = Path(temp_dir) / "fixture.json"
            report_path.write_text(
                json.dumps(
                    {
                        "errorCount": 0,
                        "benchmarks": [
                            {
                                "id": "benchmark-1",
                                "generatedComparison": {
                                    "status": "generated_meets_or_beats_benchmark",
                                    "benchmarkScore": 100,
                                    "bestGeneratedScore": 120,
                                    "delta": 20,
                                },
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )
            fixture_path.write_text(
                json.dumps(
                    {
                        "scoreTolerance": 0,
                        "benchmarks": {
                            "benchmark-1": {
                                "status": "generated_meets_or_beats_benchmark",
                                "benchmarkScore": 100,
                                "bestGeneratedScore": 120,
                                "delta": 20,
                            }
                        },
                    }
                ),
                encoding="utf-8",
            )

            status = benchmark_report_status(report_path, fixture_path)

            self.assertEqual(status["status"], "pass")

    def test_prod_review_packet_status_passes_aggregate_packet(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "packet.json"
            path.write_text(
                json.dumps(
                    {
                        "reportVersion": "build-discovery-prod-benchmark-review-packet-v1",
                        "supportedGeneratedBenchmarkPrompts": [
                            {"prompt": "200 strength Iop 11/6/0"}
                        ],
                        "futureBenchmarkPrompts": [
                            {
                                "prompt": "200 intelligence Cra 11/6/6",
                                "unsupportedReasons": ["Build Discovery v1 currently supports Iop only."],
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            status = prod_review_packet_status(path)

            self.assertEqual(status["status"], "pass")
            self.assertEqual(status["supportedPromptCount"], 1)
            self.assertEqual(status["futurePromptCount"], 1)

    def test_prod_review_packet_status_rejects_identifier_keys(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "packet.json"
            path.write_text(
                json.dumps(
                    {
                        "reportVersion": "build-discovery-prod-benchmark-review-packet-v1",
                        "supportedGeneratedBenchmarkPrompts": [
                            {"prompt": "200 strength Iop 11/6/0", "customSetId": "secret"}
                        ],
                        "futureBenchmarkPrompts": [],
                    }
                ),
                encoding="utf-8",
            )

            status = prod_review_packet_status(path)

            self.assertEqual(status["status"], "fail")
            self.assertIn("forbidden identifier keys", status["failures"][0])

    def test_prod_review_packet_status_rejects_uuid_identifier_keys(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "packet.json"
            path.write_text(
                json.dumps(
                    {
                        "reportVersion": "build-discovery-prod-benchmark-review-packet-v1",
                        "supportedGeneratedBenchmarkPrompts": [],
                        "futureBenchmarkPrompts": [
                            {
                                "prompt": "200 intelligence Cra 11/6/6",
                                "customSetUuid": "set-secret",
                                "owner_uuid": "owner-secret",
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            status = prod_review_packet_status(path)

            self.assertEqual(status["status"], "fail")
            self.assertIn("customSetUuid", status["failures"][0])
            self.assertIn("owner_uuid", status["failures"][0])

    def test_build_readiness_report_keeps_external_blockers_visible(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            checklist_path = Path(temp_dir) / "checklist.md"
            gameplay_path = Path(temp_dir) / "gameplay.md"
            assumptions_path = Path(temp_dir) / "assumptions.md"
            review_index_path = Path(temp_dir) / "review-index.md"
            checklist_path.write_text("- [ ] User review needed\n", encoding="utf-8")
            gameplay_path.write_text("# Packet\n", encoding="utf-8")
            assumptions_path.write_text("- Assumption\n", encoding="utf-8")
            review_index_path.write_text("## Release Blockers\n1. Budget\n", encoding="utf-8")

            with patch(
                "build_discovery_local_readiness_report.preflight_status",
                return_value={
                    "environment": {"readonlyDatabaseUrlPresent": False},
                    "safety": {"opensDatabaseConnection": False},
                },
            ):
                report = build_readiness_report(
                    readiness_checklist_path=checklist_path,
                    gameplay_review_packet_path=gameplay_path,
                    assumptions_ledger_path=assumptions_path,
                    assumptions_review_index_path=review_index_path,
                )

            self.assertEqual(report["status"], "incomplete")
            self.assertIn("User review needed", report["blockers"])
            self.assertIn("prod readonly database URL is not available", report["blockers"])

    def test_build_readiness_report_blocks_on_supplied_failing_artifacts(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            checklist_path = Path(temp_dir) / "checklist.md"
            gameplay_path = Path(temp_dir) / "gameplay.md"
            assumptions_path = Path(temp_dir) / "assumptions.md"
            review_index_path = Path(temp_dir) / "review-index.md"
            cache_path = Path(temp_dir) / "cache.json"
            benchmark_path = Path(temp_dir) / "benchmark.json"
            fixture_path = Path(temp_dir) / "fixture.json"
            checklist_path.write_text("- [x] Done\n", encoding="utf-8")
            gameplay_path.write_text("# Packet\n", encoding="utf-8")
            assumptions_path.write_text("- Assumption\n", encoding="utf-8")
            review_index_path.write_text("## Release Blockers\n1. Budget\n", encoding="utf-8")
            cache_path.write_text(
                json.dumps(
                    {
                        "status": "fail",
                        "summary": {
                            "cacheMisses": 1,
                            "emptyResults": 0,
                            "cacheHitElapsed": {"p95Ms": 100.0},
                        },
                    }
                ),
                encoding="utf-8",
            )
            benchmark_path.write_text(
                json.dumps(
                    {
                        "errorCount": 0,
                        "benchmarks": [],
                    }
                ),
                encoding="utf-8",
            )
            fixture_path.write_text(
                json.dumps(
                    {
                        "scoreTolerance": 0,
                        "benchmarks": {
                            "missing-benchmark": {
                                "status": "generated_meets_or_beats_benchmark",
                                "benchmarkScore": 100,
                                "bestGeneratedScore": 100,
                                "delta": 0,
                            }
                        },
                    }
                ),
                encoding="utf-8",
            )

            with patch(
                "build_discovery_local_readiness_report.preflight_status",
                return_value={
                    "environment": {"readonlyDatabaseUrlPresent": True},
                    "safety": {"opensDatabaseConnection": False},
                },
            ):
                report = build_readiness_report(
                    readiness_checklist_path=checklist_path,
                    gameplay_review_packet_path=gameplay_path,
                    assumptions_ledger_path=assumptions_path,
                    assumptions_review_index_path=review_index_path,
                    cache_prewarm_report_path=cache_path,
                    benchmark_comparison_report_path=benchmark_path,
                    benchmark_fixture_path=fixture_path,
                )

            self.assertEqual(report["status"], "incomplete")
            self.assertIn("cache prewarm validation is fail", report["blockers"])
            self.assertIn("benchmark comparison validation is fail", report["blockers"])


if __name__ == "__main__":
    unittest.main()
