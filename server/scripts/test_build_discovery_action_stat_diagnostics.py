import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from build_discovery_action_stat_diagnostics import (
    artifact_stem_for_target,
    build_diagnostics_report,
    render_markdown,
    write_split_reports,
)


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
                    "witnessSearch": {"enabled": True, "found": False, "stateLimitHit": True},
                    "reasons": ["AP optimistic upper bound 8 is below target 12"],
                }
            ],
        }

        markdown = render_markdown(report)

        self.assertIn("L1 strength 12/6/6 tier 4", markdown)
        self.assertIn("8/4/1", markdown)
        self.assertIn("not found, state cap hit", markdown)
        self.assertIn("AP optimistic upper bound", markdown)

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
        ):
            diagnostics = build_diagnostics_report(
                report,
                statuses={"no_build"},
                witness_search=True,
            )

        self.assertEqual(diagnostics["actionStatWitnessFoundCount"], 1)
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
            written = write_split_reports(
                matrix_report,
                entries,
                output_dir=Path(temp_dir),
            )

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


if __name__ == "__main__":
    unittest.main()
