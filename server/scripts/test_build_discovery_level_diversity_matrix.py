import json
import tempfile
import unittest
from pathlib import Path

from build_discovery_level_diversity_matrix import (
    REPORT_VERSION,
    build_matrix_report,
    completed_target_ids_from_split_reports,
    load_targets_from_file,
    query_summary,
    render_markdown,
    selected_targets,
    target_name_from_row,
    target_manifest_report,
    target_summary,
    render_target_manifest_markdown,
    targets_from_file,
    targets_for_set,
    targets_missing_from_split_reports,
    unique_artifact_stem_for_target,
    validate_best_build,
    write_split_matrix_reports,
)
from build_discovery_level_diversity_targets import query_for_target


class BuildDiscoveryLevelDiversityMatrixTest(unittest.TestCase):
    def test_selected_targets_filters_by_level_element_and_budget(self):
        targets = selected_targets(
            levels={60},
            elements={"agility"},
            budget_tiers={1},
        )

        self.assertEqual([target.name for target in targets], ["level_60_agility_9_3_none_budget1"])

    def test_selected_targets_can_use_boundary_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("boundary"),
            levels={1, 99},
            budget_tiers={1},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "boundary_level_1_strength_6_3_none_budget1",
                "boundary_level_99_agility_6_3_none_budget1",
            ],
        )

    def test_selected_targets_can_use_coverage_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("coverage"),
            levels={20, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "coverage_level_20_chance_range_budget1",
                "coverage_level_200_agility_cap_budget4",
            ],
        )

    def test_selected_targets_can_use_prod_level_sample_target_set(self):
        targets = targets_for_set("prod-level-sample")

        self.assertEqual(len(targets), 24)
        self.assertEqual({target.element for target in targets}, {"strength", "intelligence", "chance", "agility"})
        self.assertEqual({target.budget_tier for target in targets}, {1, 2, 3, 4})
        self.assertEqual(targets[0].name, "prod_regen_level_1_strength_6_3_none_budget1")
        self.assertEqual(targets[-1].name, "prod_regen_level_200_agility_11_6_5_budget4")
        self.assertIn("prod_regen_level_80_agility_10_4_none_budget2", {target.name for target in targets})
        self.assertIn("prod_regen_level_160_intelligence_12_5_none_budget3", {target.name for target in targets})

    def test_selected_targets_can_use_grid_next_minimum_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-minimum"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_min_level_1_strength_6_3_none_budget2",
                "grid_next_min_level_200_strength_7_3_none_budget1",
            ],
        )

    def test_selected_targets_can_use_grid_next_minimum_2_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-minimum-2"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_min2_level_1_strength_6_3_none_budget3",
                "grid_next_min2_level_200_strength_7_3_none_budget2",
            ],
        )

    def test_selected_targets_can_use_grid_next_minimum_3_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-minimum-3"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_min3_level_1_strength_6_3_none_budget4",
                "grid_next_min3_level_200_agility_7_3_none_budget1",
            ],
        )

    def test_selected_targets_can_use_grid_next_cap_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-cap"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_cap_level_1_strength_12_6_6_budget4",
                "grid_next_cap_level_200_strength_12_6_6_budget4",
            ],
        )

    def test_selected_targets_can_use_grid_next_cap_2_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-cap-2"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_cap2_level_1_intelligence_12_6_6_budget4",
                "grid_next_cap2_level_200_strength_12_6_6_budget3",
            ],
        )

    def test_selected_targets_can_use_grid_next_cap_3_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-cap-3"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_cap3_level_1_intelligence_12_6_6_budget3",
                "grid_next_cap3_level_200_strength_12_6_6_budget2",
            ],
        )

    def test_selected_targets_can_use_grid_next_cap_4_target_set(self):
        targets = selected_targets(
            all_targets=targets_for_set("grid-next-cap-4"),
            levels={1, 200},
        )

        self.assertEqual(
            [target.name for target in targets],
            [
                "grid_next_cap4_level_1_intelligence_12_6_6_budget2",
                "grid_next_cap4_level_200_strength_12_6_6_budget1",
            ],
        )

    def test_target_file_can_load_inventory_next_unproven_targets(self):
        payload = {
            "nextUnprovenTargets": [
                {
                    "level": 2,
                    "element": "intelligence",
                    "budgetTier": 1,
                    "apTarget": 6,
                    "mpTarget": 3,
                    "rangeTarget": None,
                },
                {
                    "level": 100,
                    "element": "chance",
                    "budgetTier": 2,
                    "apTarget": 7,
                    "mpTarget": 4,
                    "rangeTarget": 1,
                },
            ]
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "targets.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            targets = targets_from_file(target_file, limit=1, prefix="full_grid")

        self.assertEqual(len(targets), 1)
        self.assertEqual(targets[0].name, "full_grid_level_2_intelligence_6_3_none_budget1")
        self.assertEqual(targets[0].level, 2)
        self.assertEqual(targets[0].element, "intelligence")
        self.assertIsNone(targets[0].range_target)

    def test_target_file_coerces_string_range_target(self):
        payload = {
            "targets": [
                {
                    "level": "100",
                    "element": "chance",
                    "budgetTier": "2",
                    "apTarget": "7",
                    "mpTarget": "4",
                    "rangeTarget": "6",
                }
            ]
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "targets.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            targets = targets_from_file(target_file, prefix="full_grid")

        self.assertEqual(targets[0].range_target, 6)
        self.assertEqual(targets[0].name, "full_grid_level_100_chance_7_4_6_budget2")

    def test_target_file_can_load_matrix_results_targets(self):
        payload = {
            "results": [
                {
                    "target": {
                        "id": "matrix_target",
                        "level": 100,
                        "element": "chance",
                        "budgetTier": 2,
                        "apTarget": 7,
                        "mpTarget": 4,
                        "rangeTarget": 1,
                    }
                }
            ]
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "matrix.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            result = load_targets_from_file(target_file, prefix="full_grid")

        self.assertEqual(result.source_kind, "results")
        self.assertTrue(result.source.endswith("#results"))
        self.assertEqual(result.targets[0].name, "matrix_target")

    def test_target_file_reports_malformed_result_row_with_context(self):
        payload = {"results": [{"status": "generated"}]}

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "bad.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "results row 0 missing target object"):
                targets_from_file(target_file)

    def test_target_file_reports_missing_required_key_with_context(self):
        payload = {"targets": [{"level": 2, "element": "strength"}]}

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "bad.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "target row 0 missing budgetTier"):
                targets_from_file(target_file)

    def test_target_file_rejects_duplicate_synthesized_rows(self):
        row = {
            "level": 2,
            "element": "strength",
            "budgetTier": 1,
            "apTarget": 6,
            "mpTarget": 3,
            "rangeTarget": None,
        }
        payload = {"targets": [row, dict(row)]}

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "dupe.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "Duplicate synthesized target row key"):
                targets_from_file(target_file)

    def test_target_file_rejects_negative_limit(self):
        payload = {"targets": []}

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "targets.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "target-file-limit"):
                targets_from_file(target_file, limit=-1)

    def test_target_name_from_row_is_deterministic_for_range_targets(self):
        self.assertEqual(
            target_name_from_row(
                {
                    "level": 100,
                    "element": "chance",
                    "budgetTier": 2,
                    "apTarget": 7,
                    "mpTarget": 4,
                    "rangeTarget": 1,
                },
                prefix="full_grid",
            ),
            "full_grid_level_100_chance_7_4_1_budget2",
        )

    def test_cap_target_queries_use_deeper_search_settings(self):
        cap_target = next(
            target
            for target in targets_for_set("grid-next-cap-4")
            if target.name == "grid_next_cap4_level_200_strength_12_6_6_budget1"
        )
        minimum_target = next(
            target
            for target in targets_for_set("grid-next-minimum-3")
            if target.name == "grid_next_min3_level_200_agility_7_3_none_budget1"
        )

        cap_query = query_for_target(cap_target)
        minimum_query = query_for_target(minimum_target)

        self.assertEqual(cap_query.beam_width, 250)
        self.assertEqual(cap_query.per_signature_cap, 40)
        self.assertEqual(cap_query.relevant_set_limit, 60)
        self.assertEqual(minimum_query.beam_width, 100)
        self.assertEqual(minimum_query.per_signature_cap, 10)
        self.assertEqual(minimum_query.relevant_set_limit, 40)

    def test_build_matrix_report_records_generated_and_empty_results(self):
        selected = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})
        seen_queries = []

        def fake_generator(query):
            seen_queries.append(query)
            return {
                "datasetVersion": "dataset",
                "solverVersion": "solver",
                "cache": {"status": "miss"},
                "diagnostics": {"elapsedMs": 12.3},
                "warnings": [],
                "builds": [
                    {
                        "score": 42.0,
                        "apStrategy": "level_diversity_flexible_ap",
                        "totals": {
                            "AP": 7,
                            "MP": 3,
                            "Range": 1,
                            "Strength": 250,
                            "Vitality": 800,
                        },
                        "sets": {"Example Set": 2},
                        "exos": {},
                        "items": {
                            "amulet": {"name": "Example Amulet"},
                            "weapon": {"name": "Example Sword"},
                        },
                    }
                ],
            }

        report = build_matrix_report(
            selected,
            generator=fake_generator,
            generated_at="now",
            target_set="level-diversity",
            git_sha="abc123",
        )

        self.assertEqual(report["reportVersion"], REPORT_VERSION)
        self.assertEqual(report["targetCount"], 1)
        self.assertEqual(report["generatedCount"], 1)
        self.assertEqual(report["noBuildCount"], 0)
        self.assertEqual(report["invalidCount"], 0)
        self.assertEqual(
            report["provenance"]["targetSource"],
            "scripts.build_discovery_level_diversity_targets.LEVEL_DIVERSITY_TARGETS",
        )
        self.assertEqual(report["provenance"]["gitSha"], "abc123")
        self.assertEqual(report["evidenceType"], "generated_solver_snapshot")
        self.assertEqual(seen_queries[0].level, 50)
        self.assertEqual(report["results"][0]["validationErrors"], [])
        self.assertEqual(report["results"][0]["bestBuildSummary"]["items"], ["Example Amulet", "Example Sword"])

    def test_target_manifest_report_records_targets_without_build_results(self):
        selected = targets_for_set("prod-level-sample")[:1]

        report = target_manifest_report(
            selected,
            generated_at="now",
            target_set="prod-level-sample",
            git_sha="abc123",
        )

        self.assertEqual(report["reportVersion"], "build-discovery-level-target-manifest-v1")
        self.assertEqual(report["targetCount"], 1)
        self.assertEqual(report["evidenceType"], "target_selection_manifest")
        self.assertEqual(report["targets"][0]["target"], target_summary(selected[0]))
        self.assertEqual(report["targets"][0]["query"]["className"], "Iop")
        self.assertEqual(report["targets"][0]["search"]["topK"], 25)
        self.assertNotIn("results", report)

    def test_render_target_manifest_markdown_marks_non_evidence(self):
        selected = targets_for_set("prod-level-sample")[:1]
        report = target_manifest_report(
            selected,
            generated_at="now",
            target_set="prod-level-sample",
            git_sha="abc123",
        )

        markdown = render_target_manifest_markdown(report)

        self.assertIn("target-selection manifest only", markdown)
        self.assertIn("L1 strength 6/3/any tier 1", markdown)

    def test_write_split_matrix_reports_writes_each_target_as_it_finishes(self):
        selected = selected_targets(levels={50}, elements={"strength", "intelligence"})

        def fake_generator(query):
            return {
                "datasetVersion": "dataset",
                "solverVersion": "solver",
                "cache": {"status": "miss"},
                "diagnostics": {"elapsedMs": query.level},
                "warnings": [],
                "builds": [
                    {
                        "score": 1,
                        "apStrategy": "test",
                        "totals": {
                            "AP": query.ap_target,
                            "MP": query.mp_target,
                            "Range": query.target.range,
                            "Strength": 100,
                            "Intelligence": 100,
                            "Vitality": 100,
                        },
                        "sets": {},
                        "exos": {},
                        "conditionFailures": [],
                        "items": {"amulet": {"name": "Example Amulet", "level": query.level}},
                    }
                ],
            }

        with tempfile.TemporaryDirectory() as temp_dir:
            split_result = write_split_matrix_reports(
                selected,
                output_dir=Path(temp_dir),
                generator=fake_generator,
                generated_at="now",
                target_set="level-diversity",
                git_sha="abc123",
            )
            manifest_path = Path(temp_dir) / "manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

            self.assertEqual(split_result["aggregateReport"]["targetCount"], 2)
            self.assertEqual(manifest["splitReportCount"], 2)
            for row in manifest["reports"]:
                self.assertTrue(Path(row["json"]).exists())
                self.assertTrue(Path(row["markdown"]).exists())
                one_row = json.loads(Path(row["json"]).read_text(encoding="utf-8"))
                self.assertEqual(one_row["targetCount"], 1)

    def test_write_split_matrix_reports_resume_existing_skips_completed_target(self):
        selected = selected_targets(levels={50}, elements={"strength", "intelligence"})
        calls = []

        def fake_generator(query):
            calls.append(query.primary_element)
            return {
                "builds": [
                    {
                        "score": 1,
                        "totals": {
                            "AP": query.ap_target,
                            "MP": query.mp_target,
                            "Range": query.target.range,
                            "Strength": 100,
                            "Intelligence": 100,
                            "Vitality": 100,
                        },
                        "sets": {},
                        "exos": {},
                        "conditionFailures": [],
                        "items": {"amulet": {"name": "Example Amulet", "level": query.level}},
                    }
                ],
            }

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            first_target = selected[0]
            first_query = query_for_target(first_target)
            first_report = {
                "reportVersion": REPORT_VERSION,
                "generatedAt": "old",
                "scope": "Iop level-diversity generated target matrix",
                "evidenceType": "generated_solver_snapshot",
                "provenance": {"gitSha": "old", "targetSource": "old", "generator": "test"},
                "targetCount": 1,
                "generatedCount": 0,
                "noBuildCount": 1,
                "invalidCount": 0,
                "results": [
                    {
                        "target": target_summary(first_target),
                        "query": query_summary(first_query),
                        "status": "no_build",
                        "resultCount": 0,
                        "validationErrors": ["no build returned"],
                        "bestBuild": None,
                        "bestBuildSummary": None,
                    }
                ],
            }
            existing_json = output_dir / f"{first_target.name}.json"
            existing_json.write_text(json.dumps(first_report), encoding="utf-8")

            split_result = write_split_matrix_reports(
                selected,
                output_dir=output_dir,
                generator=fake_generator,
                generated_at="now",
                target_set="level-diversity",
                git_sha="new",
                resume_existing=True,
            )
            manifest = json.loads((output_dir / "manifest.json").read_text(encoding="utf-8"))

        self.assertEqual(calls, ["intelligence"])
        self.assertEqual(split_result["aggregateReport"]["targetCount"], 2)
        self.assertEqual(split_result["aggregateReport"]["noBuildCount"], 1)
        self.assertEqual(split_result["aggregateReport"]["generatedCount"], 1)
        self.assertEqual([row["resumed"] for row in manifest["reports"]], [True, False])

    def test_write_split_matrix_reports_resume_existing_rejects_mismatched_target(self):
        selected = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            target = selected[0]
            bad_report = {
                "reportVersion": REPORT_VERSION,
                "results": [{"target": {"id": "different_target"}}],
            }
            (output_dir / f"{target.name}.json").write_text(json.dumps(bad_report), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "does not match target"):
                write_split_matrix_reports(
                    selected,
                    output_dir=output_dir,
                    generator=lambda query: {"builds": []},
                    resume_existing=True,
                )

    def test_write_split_matrix_reports_resume_existing_rejects_stale_query(self):
        selected = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            target = selected[0]
            query = query_for_target(target)
            stale_report = {
                "reportVersion": REPORT_VERSION,
                "results": [
                    {
                        "target": target_summary(target),
                        "query": {**query_summary(query), "budgetTier": 99},
                        "status": "no_build",
                        "resultCount": 0,
                        "validationErrors": ["no build returned"],
                        "bestBuild": None,
                        "bestBuildSummary": None,
                    }
                ],
            }
            (output_dir / f"{target.name}.json").write_text(json.dumps(stale_report), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "query payload is stale"):
                write_split_matrix_reports(
                    selected,
                    output_dir=output_dir,
                    generator=lambda query: {"builds": []},
                    resume_existing=True,
                )

    def test_targets_missing_from_split_reports_filters_valid_generated_targets(self):
        selected = selected_targets(levels={50}, elements={"strength", "intelligence"})

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            target = selected[0]
            query = query_for_target(target)
            report = {
                "reportVersion": REPORT_VERSION,
                "results": [
                    {
                        "target": target_summary(target),
                        "query": query_summary(query),
                        "status": "generated",
                        "resultCount": 1,
                        "validationErrors": [],
                        "bestBuild": {
                            "score": 1,
                            "totals": {
                                "AP": query.ap_target,
                                "MP": query.mp_target,
                                "Range": query.target.range,
                                "Strength": 100,
                                "Intelligence": 100,
                                "Vitality": 100,
                            },
                            "sets": {},
                            "exos": {},
                            "conditionFailures": [],
                            "items": {"amulet": {"name": "Example Amulet", "level": query.level}},
                        },
                        "bestBuildSummary": {"score": 1},
                    }
                ],
            }
            (output_dir / f"{target.name}.json").write_text(json.dumps(report), encoding="utf-8")
            stale_manifest = {
                "splitReportCount": 0,
                "reports": [],
            }
            (output_dir / "manifest.json").write_text(json.dumps(stale_manifest), encoding="utf-8")

            missing = targets_missing_from_split_reports(selected, output_dir)

        self.assertEqual([target.name for target in missing], [selected[1].name])

    def test_targets_missing_from_split_reports_retries_no_build_targets(self):
        selected = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            target = selected[0]
            query = query_for_target(target)
            report = {
                "reportVersion": REPORT_VERSION,
                "results": [
                    {
                        "target": target_summary(target),
                        "query": query_summary(query),
                        "status": "no_build",
                        "resultCount": 0,
                        "validationErrors": ["no build returned"],
                        "bestBuild": None,
                        "bestBuildSummary": None,
                    }
                ],
            }
            (output_dir / f"{target.name}.json").write_text(json.dumps(report), encoding="utf-8")

            missing = targets_missing_from_split_reports(selected, output_dir)

        self.assertEqual([target.name for target in missing], [target.name])

    def test_completed_target_ids_from_split_reports_missing_dir_is_empty(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_dir = Path(temp_dir) / "missing"
            self.assertEqual(completed_target_ids_from_split_reports([], missing_dir), set())

    def test_unique_artifact_stem_for_target_preserves_collision_order(self):
        first = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})[0]
        second = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})[0]
        used = set()

        self.assertEqual(unique_artifact_stem_for_target(first, used), first.name)
        self.assertEqual(unique_artifact_stem_for_target(second, used), f"{first.name}-2")

    def test_coverage_report_is_labeled_as_action_stat_feasibility(self):
        selected = selected_targets(
            all_targets=targets_for_set("coverage"),
            target_names={"coverage_level_20_chance_range_budget1"},
        )

        report = build_matrix_report(
            selected,
            generator=lambda query: {
                "builds": [
                    {
                        "score": 1,
                        "totals": {"AP": 6, "MP": 3, "Range": 1, "Chance": 100, "Vitality": 100},
                        "sets": {},
                        "exos": {},
                        "conditionFailures": [],
                        "items": {"amulet": {"name": "Range Amulet", "level": 20}},
                    }
                ],
            },
            generated_at="now",
            target_set="coverage",
            git_sha="def456",
        )

        markdown = render_markdown(report)

        self.assertEqual(report["evidenceType"], "action_stat_feasibility")
        self.assertEqual(report["provenance"]["gitSha"], "def456")
        self.assertIn("action-stat feasibility evidence", markdown)

    def test_target_file_report_records_target_file_provenance(self):
        payload = {
            "targets": [
                {
                    "level": 2,
                    "element": "intelligence",
                    "budgetTier": 1,
                    "apTarget": 6,
                    "mpTarget": 3,
                    "rangeTarget": None,
                }
            ]
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            target_file = Path(temp_dir) / "targets.json"
            target_file.write_text(json.dumps(payload), encoding="utf-8")
            load_result = load_targets_from_file(target_file, limit=1, prefix="full_grid")

            report = build_matrix_report(
                load_result.targets,
                generator=lambda query: {
                    "builds": [
                        {
                            "score": 1,
                            "totals": {
                                "AP": query.ap_target,
                                "MP": query.mp_target,
                                "Range": 0,
                                "Intelligence": 100,
                                "Vitality": 100,
                            },
                            "sets": {},
                            "exos": {},
                            "conditionFailures": [],
                            "items": {"amulet": {"name": "Example Amulet", "level": query.level}},
                        }
                    ],
                },
                generated_at="now",
                target_set="target-file",
                git_sha="file-sha",
                target_source=load_result.source,
            )

        self.assertTrue(report["provenance"]["targetSource"].endswith("targets.json#targets"))
        self.assertEqual(report["scope"], "Iop target-file generated target matrix")

    def test_validate_best_build_rejects_condition_and_target_violations(self):
        target = selected_targets(target_names={"level_50_strength_7_3_1_budget1"})[0]

        errors = validate_best_build(
            target,
            query_for_target(target),
            {
                "conditionFailures": ["bad condition"],
                "totals": {"AP": 13, "MP": 2, "Range": 0, "Vitality": 100},
                "items": {"amulet": {"level": 60}},
            },
        )

        self.assertTrue(any("condition failures" in error for error in errors))
        self.assertTrue(any("AP total" in error for error in errors))
        self.assertTrue(any("MP total" in error for error in errors))
        self.assertTrue(any("Range total" in error for error in errors))
        self.assertTrue(any("item level" in error for error in errors))

    def test_render_markdown_includes_review_table(self):
        report = {
            "scope": "Iop grid-next-minimum-3 generated target matrix",
            "generatedAt": "now",
            "targetCount": 1,
            "generatedCount": 1,
            "noBuildCount": 0,
            "invalidCount": 0,
            "results": [
                {
                    "target": {
                        "level": 50,
                        "element": "strength",
                        "budgetTier": 1,
                        "apTarget": 7,
                        "mpTarget": 3,
                        "rangeTarget": None,
                    },
                    "status": "generated",
                    "validationErrors": [],
                    "diagnostics": {"elapsedMs": 12.3},
                    "bestBuildSummary": {
                        "score": 42.0,
                        "totals": {"AP": 7, "MP": 4, "Range": 0, "Strength": 250, "Vitality": 800},
                        "sets": {"Example Set": 2},
                        "items": ["Example Amulet", "Example Sword"],
                    },
                }
            ],
        }

        markdown = render_markdown(report)

        self.assertIn("# Build Discovery Iop Grid Next Minimum 3 Matrix", markdown)
        self.assertIn("sampled target set", markdown)
        self.assertNotIn("Milestone 3", markdown)
        self.assertIn("L50 strength 7/3/any tier 1", markdown)
        self.assertIn("Example Amulet, Example Sword", markdown)


if __name__ == "__main__":
    unittest.main()
