import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from build_discovery_action_stat_diagnostics import (
    artifact_stem_for_target,
    build_diagnostics_report,
    find_action_stat_witness_result,
    main,
    render_markdown,
    solver_candidate_pool_coverage,
    write_split_reports,
)
from oneoff.build_discovery_prototype import BuildDiscoveryQuery


def matrix_entry(level=1, status="no_build"):
    return {
        "status": status,
        "target": {
            "id": f"target_{level}",
            "className": "Iop",
            "level": level,
            "element": "strength",
            "budgetTier": 4,
            "apTarget": 12,
            "mpTarget": 6,
            "rangeTarget": 6,
        },
        "query": {
            "className": "Iop",
            "level": level,
            "elements": ["strength"],
            "mode": "pvm",
            "apTarget": 12,
            "mpTarget": 6,
            "rangeTarget": 6,
            "damageSurvivabilityPreset": 3,
            "budgetTier": 4,
            "exoPolicy": "allow",
            "weaponPolicy": "stat_stick_allowed",
            "lockedItemIds": [],
            "avoidedItemIds": [],
        },
    }


def item(item_id, item_type, stats):
    return {
        "dofusID": item_id,
        "_name": item_id,
        "itemType": item_type,
        "level": 1,
        "_score": sum(stats.values()),
        "_stats": stats,
    }


class BuildDiscoveryActionStatDiagnosticsTest(unittest.TestCase):
    def test_report_flags_upper_bound_below_target(self):
        report = {"results": [matrix_entry(level=1)]}

        with patch(
            "build_discovery_action_stat_diagnostics.load_items",
            return_value=[
                item("ring", "Ring", {"AP": 1}),
                item("boots", "Boots", {"MP": 1}),
                item("hat", "Hat", {"Range": 1}),
            ],
        ):
            diagnostics = build_diagnostics_report(report, statuses={"no_build"})

        self.assertEqual(diagnostics["diagnosticCount"], 1)
        self.assertEqual(diagnostics["itemStatUpperBoundBelowTargetCount"], 1)
        self.assertEqual(diagnostics["witnessSearchRunCount"], 0)
        self.assertEqual(
            diagnostics["diagnostics"][0]["diagnosticStatus"],
            "item_stat_upper_bound_below_target",
        )
        self.assertTrue(any("AP optimistic upper bound" in reason for reason in diagnostics["diagnostics"][0]["reasons"]))

    def test_report_keeps_not_proven_infeasible_when_upper_bound_reaches_target(self):
        report = {"results": [matrix_entry(level=100)]}

        with patch(
            "build_discovery_action_stat_diagnostics.load_items",
            return_value=[
                item("amulet", "Amulet", {"AP": 5, "MP": 0, "Range": 0}),
                item("boots", "Boots", {"AP": 0, "MP": 3, "Range": 0}),
                item("hat", "Hat", {"AP": 0, "MP": 0, "Range": 6}),
            ],
        ):
            diagnostics = build_diagnostics_report(report, statuses={"no_build"})

        self.assertEqual(diagnostics["itemStatUpperBoundBelowTargetCount"], 0)
        self.assertEqual(diagnostics["notProvenInfeasibleCount"], 1)
        self.assertEqual(
            diagnostics["diagnostics"][0]["diagnosticStatus"],
            "not_proven_infeasible",
        )

    def test_render_markdown_summarizes_reasons(self):
        report = {
            "diagnosticCount": 1,
            "itemStatUpperBoundBelowTargetCount": 1,
            "notProvenInfeasibleCount": 0,
            "witnessSearchRunCount": 1,
            "actionStatWitnessFoundCount": 1,
            "diagnostics": [
                {
                    "target": {
                        "level": 1,
                        "element": "strength",
                        "budgetTier": 4,
                        "apTarget": 12,
                        "mpTarget": 6,
                        "rangeTarget": 6,
                    },
                    "matrixStatus": "no_build",
                    "diagnosticStatus": "item_stat_upper_bound_below_target",
                    "optimisticIndependentSlotUpperBound": {"AP": 8, "MP": 4, "Range": 1},
                    "witnessSearch": {"enabled": True, "found": True, "stateLimitHit": True},
                    "actionStatWitness": {"totals": {"AP": 12, "MP": 6, "Range": 6}},
                    "reasons": ["AP optimistic upper bound 8 is below target 12"],
                }
            ],
        }

        markdown = render_markdown(report)

        self.assertIn("L1 strength 12/6/6 tier 4", markdown)
        self.assertIn("8/4/1", markdown)
        self.assertIn("found, state cap hit", markdown)
        self.assertIn("Witness searches run: `1`", markdown)
        self.assertIn("Action-stat witnesses found: `1` of `1` searched", markdown)
        self.assertIn("not checked", markdown)
        self.assertIn("AP optimistic upper bound", markdown)

    def test_solver_candidate_pool_coverage_reports_missing_witness_items(self):
        witness = {
            "items": [
                {"slot": "amulet", "id": "kept", "name": "Kept Amulet"},
                {"slot": "belt", "id": "missing", "name": "Missing Belt"},
            ]
        }

        def fake_pool(slot_types, items, relevant_sets, top_k, **kwargs):
            if slot_types == ("Amulet",):
                return [{"dofusID": "kept"}]
            return []

        with patch("build_discovery_action_stat_diagnostics.relevant_set_ids", return_value=set()), patch(
            "build_discovery_action_stat_diagnostics.candidate_pool_for_slot",
            side_effect=fake_pool,
        ):
            coverage = solver_candidate_pool_coverage(
                BuildDiscoveryQuery(level=50, top_k=1),
                witness,
                items=[],
                sets={},
            )

        self.assertEqual(coverage["missingCount"], 1)
        self.assertIsInstance(coverage["elapsedMs"], float)
        self.assertEqual(coverage["missingItems"][0]["name"], "Missing Belt")
        self.assertEqual(coverage["items"][0]["inSolverPool"], True)

    def test_diagnostics_use_matrix_query_exo_policy(self):
        entry = matrix_entry(level=100)
        entry["query"]["exoPolicy"] = "none"
        report = {"results": [entry]}

        with patch(
            "build_discovery_action_stat_diagnostics.load_items",
            return_value=[
                item("amulet", "Amulet", {"AP": 4, "MP": 0, "Range": 0}),
                item("boots", "Boots", {"AP": 0, "MP": 3, "Range": 0}),
                item("hat", "Hat", {"AP": 0, "MP": 0, "Range": 6}),
            ],
        ):
            diagnostics = build_diagnostics_report(report, statuses={"no_build"})

        diagnostic = diagnostics["diagnostics"][0]
        self.assertEqual(diagnostic["effectiveExoPolicy"], "none")
        self.assertEqual(diagnostic["optimisticIndependentSlotUpperBound"], {"AP": 11, "MP": 6, "Range": 6})

    def test_top_action_sources_exclude_negative_only_items(self):
        report = {"results": [matrix_entry(level=1)]}

        with patch(
            "build_discovery_action_stat_diagnostics.load_items",
            return_value=[
                item("negative_boots", "Boots", {"AP": -1, "MP": -1, "Range": 0}),
                item("positive_boots", "Boots", {"AP": 0, "MP": 1, "Range": 0}),
            ],
        ):
            diagnostics = build_diagnostics_report(report, statuses={"no_build"})

        boots = next(
            summary for summary in diagnostics["diagnostics"][0]["slotSummaries"] if summary["slot"] == "boots"
        )
        self.assertEqual(boots["actionSourceCount"], 1)
        self.assertEqual([item["id"] for item in boots["topActionSources"]], ["positive_boots"])

    def test_witness_search_promotes_diagnostic_status(self):
        report = {"results": [matrix_entry(level=50)]}

        with patch(
            "build_discovery_action_stat_diagnostics.load_items",
            return_value=[item("amulet", "Amulet", {"AP": 5, "MP": 3, "Range": 6})],
        ), patch(
            "build_discovery_action_stat_diagnostics.find_action_stat_witness_result",
            return_value={
                "enabled": True,
                "maxStatesPerSlot": 20_000,
                "stateLimitHit": False,
                "found": True,
                "witness": {"totals": {"AP": 12, "MP": 6, "Range": 6}, "items": []},
            },
        ), patch(
            "build_discovery_action_stat_diagnostics.solver_candidate_pool_coverage",
            return_value={"missingCount": 0, "missingItems": [], "items": []},
        ), patch(
            "build_discovery_action_stat_diagnostics.load_sets",
            return_value={},
        ):
            diagnostics = build_diagnostics_report(
                report,
                statuses={"no_build"},
                witness_search=True,
            )

        self.assertEqual(diagnostics["actionStatWitnessFoundCount"], 1)
        self.assertEqual(diagnostics["witnessSearchRunCount"], 1)
        self.assertEqual(
            diagnostics["diagnostics"][0]["diagnosticStatus"],
            "action_stat_witness_found",
        )
        self.assertEqual(
            diagnostics["diagnostics"][0]["witnessSearch"],
            {
                "enabled": True,
                "maxStatesPerSlot": 20_000,
                "stateLimitHit": False,
                "found": True,
            },
        )
        self.assertIsNone(diagnostics["diagnostics"][0]["solverCandidatePoolCoverage"])

    def test_witness_search_uses_query_level_base_ap(self):
        filler_items = []
        for slot_name, slot_types in [
            ("amulet", ("Amulet",)),
            ("belt", ("Belt",)),
            ("weapon", ("Sword",)),
            ("shield", ("Shield",)),
            ("ring_1", ("Ring",)),
            ("ring_2", ("Ring",)),
            ("boots", ("Boots",)),
            ("hat", ("Hat",)),
            ("cloak", ("Cloak",)),
        ]:
            filler_items.append(item(f"{slot_name}_filler", slot_types[0], {}))

        with patch(
            "build_discovery_action_stat_diagnostics.load_items",
            return_value=filler_items,
        ), patch(
            "build_discovery_action_stat_diagnostics.load_sets",
            return_value={},
        ):
            result = find_action_stat_witness_result(
                BuildDiscoveryQuery(level=99, ap_target=7, mp_target=3, range_target=0),
                max_states_per_slot=20,
            )

        self.assertFalse(result["found"])

    def test_artifact_stem_for_target_sanitizes_ids(self):
        entry = {"target": {"id": "cap row/level 20:chance"}}

        self.assertEqual(artifact_stem_for_target(entry), "cap-row-level-20-chance")

    def test_write_split_reports_writes_one_artifact_per_entry_and_manifest(self):
        entries = [
            matrix_entry(level=1),
            matrix_entry(level=20),
        ]
        entries[0]["target"]["id"] = "target/one"
        entries[1]["target"]["id"] = "target two"
        matrix_report = {"scope": "Iop test matrix", "generatedAt": "now", "results": entries}

        def fake_diagnose(entry, **kwargs):
            return {
                "target": entry["target"],
                "query": {},
                "matrixStatus": entry["status"],
                "catalogItemCount": 0,
                "effectiveExoPolicy": "allow",
                "optimisticIndependentSlotUpperBound": {"AP": 7, "MP": 4, "Range": 1},
                "diagnosticStatus": "item_stat_upper_bound_below_target",
                "reasons": ["AP optimistic upper bound 7 is below target 12"],
                "witnessSearch": {"enabled": False, "maxStatesPerSlot": 20_000, "stateLimitHit": False, "found": False},
                "actionStatWitness": None,
                "slotSummaries": [],
            }

        with tempfile.TemporaryDirectory() as temp_dir, patch(
            "build_discovery_action_stat_diagnostics.diagnose_entry",
            side_effect=fake_diagnose,
        ):
            split_result = write_split_reports(
                matrix_report,
                entries,
                output_dir=Path(temp_dir),
            )

            written = split_result["manifest"]["reports"]
            self.assertEqual([row["targetId"] for row in written], ["target/one", "target two"])
            self.assertTrue((Path(temp_dir) / "target-one.json").exists())
            self.assertTrue((Path(temp_dir) / "target-one.md").exists())
            self.assertTrue((Path(temp_dir) / "target-two.json").exists())
            manifest = json.loads((Path(temp_dir) / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["splitReportCount"], 2)
            self.assertEqual(
                [row["diagnosticStatus"] for row in manifest["reports"]],
                ["item_stat_upper_bound_below_target", "item_stat_upper_bound_below_target"],
            )
            self.assertEqual(split_result["aggregateReport"]["diagnosticCount"], 2)

    def test_write_split_reports_avoids_sanitized_filename_collisions(self):
        entries = [
            matrix_entry(level=1),
            matrix_entry(level=20),
        ]
        entries[0]["target"]["id"] = "target/one"
        entries[1]["target"]["id"] = "target one"
        matrix_report = {"scope": "Iop test matrix", "generatedAt": "now", "results": entries}

        with tempfile.TemporaryDirectory() as temp_dir, patch(
            "build_discovery_action_stat_diagnostics.diagnose_entry",
            return_value={
                "target": entries[0]["target"],
                "query": {},
                "matrixStatus": "no_build",
                "catalogItemCount": 0,
                "effectiveExoPolicy": "allow",
                "optimisticIndependentSlotUpperBound": {"AP": 7, "MP": 4, "Range": 1},
                "diagnosticStatus": "item_stat_upper_bound_below_target",
                "reasons": ["AP optimistic upper bound 7 is below target 12"],
                "witnessSearch": {"enabled": False, "maxStatesPerSlot": 20_000, "stateLimitHit": False, "found": False},
                "actionStatWitness": None,
                "slotSummaries": [],
            },
        ):
            split_result = write_split_reports(matrix_report, entries, output_dir=Path(temp_dir))

            self.assertTrue((Path(temp_dir) / "target-one.json").exists())
            self.assertTrue((Path(temp_dir) / "target-one-2.json").exists())
            self.assertEqual(
                [Path(row["json"]).name for row in split_result["manifest"]["reports"]],
                ["target-one.json", "target-one-2.json"],
            )

    def test_split_output_cli_honors_aggregate_output_paths(self):
        entry = matrix_entry(level=1)
        matrix_report = {"scope": "Iop test matrix", "generatedAt": "now", "results": [entry]}

        with tempfile.TemporaryDirectory() as temp_dir:
            matrix_path = Path(temp_dir) / "matrix.json"
            split_dir = Path(temp_dir) / "split"
            aggregate_json = Path(temp_dir) / "aggregate.json"
            aggregate_md = Path(temp_dir) / "aggregate.md"
            matrix_path.write_text(json.dumps(matrix_report), encoding="utf-8")
            argv = [
                "build_discovery_action_stat_diagnostics.py",
                str(matrix_path),
                "--split-output-dir",
                str(split_dir),
                "--output-json",
                str(aggregate_json),
                "--output-md",
                str(aggregate_md),
            ]

            with patch.object(sys, "argv", argv), patch(
                "build_discovery_action_stat_diagnostics.diagnose_entry",
                return_value={
                    "target": entry["target"],
                    "query": {},
                    "matrixStatus": "no_build",
                    "catalogItemCount": 0,
                    "effectiveExoPolicy": "allow",
                    "optimisticIndependentSlotUpperBound": {"AP": 7, "MP": 4, "Range": 1},
                    "diagnosticStatus": "item_stat_upper_bound_below_target",
                    "reasons": ["AP optimistic upper bound 7 is below target 12"],
                    "witnessSearch": {"enabled": False, "maxStatesPerSlot": 20_000, "stateLimitHit": False, "found": False},
                    "actionStatWitness": None,
                    "slotSummaries": [],
                },
            ):
                main()

            self.assertTrue((split_dir / "target_1.json").exists())
            self.assertTrue((split_dir / "manifest.json").exists())
            self.assertTrue(aggregate_json.exists())
            self.assertTrue(aggregate_md.exists())
            self.assertEqual(json.loads(aggregate_json.read_text(encoding="utf-8"))["diagnosticCount"], 1)

    def test_cli_fails_when_filters_match_no_matrix_rows(self):
        matrix_report = {"scope": "Iop test matrix", "generatedAt": "now", "results": [matrix_entry(level=1)]}

        with tempfile.TemporaryDirectory() as temp_dir:
            matrix_path = Path(temp_dir) / "matrix.json"
            output_json = Path(temp_dir) / "diagnostics.json"
            matrix_path.write_text(json.dumps(matrix_report), encoding="utf-8")
            argv = [
                "build_discovery_action_stat_diagnostics.py",
                str(matrix_path),
                "--targets",
                "missing_target",
                "--output-json",
                str(output_json),
            ]

            with patch.object(sys, "argv", argv), self.assertRaises(SystemExit) as raised:
                main()

            self.assertNotEqual(raised.exception.code, 0)
            self.assertFalse(output_json.exists())


if __name__ == "__main__":
    unittest.main()
