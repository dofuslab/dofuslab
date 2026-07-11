import argparse
import os
import unittest
from datetime import datetime
from pathlib import Path
import sys
from unittest.mock import MagicMock, Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_prod_benchmark_discovery import (
    MAX_SAMPLE_LIMIT,
    MIN_EQUIPPED_SLOT_COUNT,
    MIN_PROFILE_SAMPLE_COUNT,
    REPORT_VERSION,
    bucket_key,
    discover_prod_benchmarks,
    dominant_element,
    enforce_bounds,
    generated_query_candidate,
    prod_database_url,
    preflight_status,
    recent_build_rows,
    summarize_rows,
    validate_bounds,
)


class BuildDiscoveryProdBenchmarkDiscoveryTest(unittest.TestCase):
    def test_preflight_status_does_not_expose_database_url_or_connect(self):
        with patch.dict(
            os.environ,
            {"DOFUSLAB_READONLY_DATABASE_URL": "postgresql://readonly-secret"},
        ):
            report = preflight_status()

        self.assertEqual(report["mode"], "preflight")
        self.assertTrue(report["environment"]["readonlyDatabaseUrlPresent"])
        self.assertIsInstance(report["environment"]["sqlalchemyAvailable"], bool)
        self.assertFalse(report["safety"]["opensDatabaseConnection"])
        self.assertFalse(report["safety"]["printsDatabaseUrl"])
        self.assertNotIn("readonly-secret", str(report))

    def test_prod_database_url_requires_readonly_env(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(SystemExit):
                prod_database_url()

        with patch.dict(os.environ, {"DOFUSLAB_READONLY_DATABASE_URL": "postgresql://readonly"}):
            self.assertEqual(prod_database_url(), "postgresql://readonly")

    def test_validate_bounds_rejects_unbounded_sample(self):
        parser = argparse.ArgumentParser()
        args = argparse.Namespace(
            sample_limit=MAX_SAMPLE_LIMIT + 1,
            top_items=1,
            statement_timeout_ms=5000,
        )

        with self.assertRaises(SystemExit):
            validate_bounds(parser, args)

        with self.assertRaises(ValueError):
            enforce_bounds(MAX_SAMPLE_LIMIT + 1, 1, 5000)

    def test_dominant_element_uses_base_and_item_stats(self):
        row = {
            "strength_points": 398,
            "item_strength": 450,
            "intelligence_points": 995,
            "item_intelligence": 50,
            "chance_points": 0,
            "item_chance": 200,
            "agility_points": 0,
            "item_agility": 100,
            "class_name": "Iop",
            "ap": 4,
            "mp": 3,
            "range": 0,
        }

        self.assertEqual(dominant_element(row), "intelligence")
        self.assertEqual(bucket_key(row), ("Iop", "intelligence", 11, 6, 0))

    def test_summarize_rows_groups_profiles_and_common_items_for_large_enough_buckets(self):
        rows = [
            {
                "custom_set_id": f"set-{index}",
                "last_modified": datetime(2026, 7, 8),
                "class_name": "Iop",
                "ap": 4,
                "mp": 3,
                "range": 0,
                "strength_points": 995,
                "intelligence_points": 0,
                "chance_points": 0,
                "agility_points": 0,
                "item_strength": 300,
                "item_intelligence": 0,
                "item_chance": 0,
                "item_agility": 0,
                "equipped_item_names": ["Crimson Dofus", "Ochre Dofus" if index == 0 else "Turquoise Dofus"],
            }
            for index in range(MIN_PROFILE_SAMPLE_COUNT)
        ]

        summary = summarize_rows(rows, top_items=2)

        self.assertEqual(summary["classDistribution"], [{"className": "Iop", "sampleCount": 3}])
        self.assertEqual(summary["profiles"][0]["className"], "Iop")
        self.assertEqual(summary["profiles"][0]["element"], "strength")
        self.assertEqual(summary["profiles"][0]["sampleCount"], 3)
        self.assertEqual(
            summary["profiles"][0]["generatedQueryCandidate"],
            {
                "supported": True,
                "unsupportedReasons": [],
                "query": {
                    "className": "Iop",
                    "level": 200,
                    "mode": "pvm",
                    "elements": ["strength"],
                    "apTarget": 11,
                    "mpTarget": 6,
                    "rangeTarget": 0,
                    "damageSurvivabilityPreset": 2,
                    "budgetTier": 4,
                    "exoPolicy": "opti",
                },
            },
        )
        self.assertEqual(
            summary["profiles"][0]["commonItems"],
            [
                {"name": "Crimson Dofus", "sampleCount": 3},
                {"name": "Turquoise Dofus", "sampleCount": 2},
            ],
        )

    def test_summarize_rows_suppresses_singleton_profile_buckets(self):
        rows = [
            {
                "custom_set_id": "set-1",
                "last_modified": datetime(2026, 7, 7),
                "class_name": "Iop",
                "ap": 4,
                "mp": 3,
                "range": 0,
                "strength_points": 398,
                "intelligence_points": 0,
                "chance_points": 0,
                "agility_points": 0,
                "item_strength": 700,
                "item_intelligence": 0,
                "item_chance": 0,
                "item_agility": 0,
                "equipped_item_names": ["Crimson Dofus", "Ochre Dofus"],
            },
        ]

        summary = summarize_rows(rows, top_items=2)

        self.assertEqual(summary["classDistribution"], [{"className": "Iop", "sampleCount": 1}])
        self.assertEqual(summary["profiles"], [])

    def test_generated_query_candidate_supports_known_non_iop_classes(self):
        candidate = generated_query_candidate("Cra", "intelligence", 11, 6, 6)

        self.assertTrue(candidate["supported"])
        self.assertEqual(candidate["query"]["className"], "Cra")
        self.assertEqual(candidate["query"]["elements"], ["intelligence"])
        self.assertEqual(candidate["query"]["damageSurvivabilityPreset"], 2)
        self.assertEqual(candidate["query"]["budgetTier"], 4)
        self.assertEqual(candidate["query"]["exoPolicy"], "opti")

    def test_generated_query_candidate_marks_unsupported_prod_profiles(self):
        candidate = generated_query_candidate("Cra", "intelligence", 11, 6, 7)

        self.assertFalse(candidate["supported"])
        self.assertNotIn("query", candidate)
        self.assertIn("Range target", " ".join(candidate["unsupportedReasons"]))

    def test_generated_query_candidate_maps_negative_range_to_any_range(self):
        candidate = generated_query_candidate("Sacrier", "agility", 12, 5, -2)

        self.assertTrue(candidate["supported"])
        self.assertIsNone(candidate["query"]["rangeTarget"])

    def test_discover_prod_benchmarks_uses_readonly_connection_and_limits(self):
        connection = Mock()
        engine = Mock()
        connect_context = MagicMock()
        engine.connect.return_value = connect_context
        engine.connect.return_value.__enter__.return_value = connection
        transaction_context = MagicMock()
        connection.begin.return_value = transaction_context
        rows = [
            {
                "custom_set_id": "set-1",
                "last_modified": datetime(2026, 7, 8),
                "class_name": "Iop",
                "ap": 5,
                "mp": 3,
                "range": 0,
                "strength_points": 0,
                "intelligence_points": 995,
                "chance_points": 0,
                "agility_points": 0,
                "item_strength": 0,
                "item_intelligence": 500,
                "item_chance": 0,
                "item_agility": 0,
                "equipped_item_names": ["Ochre Dofus"],
            }
        ]

        with patch(
            "oneoff.build_discovery_prod_benchmark_discovery.create_engine",
            return_value=engine,
        ) as create_engine:
            with patch("oneoff.build_discovery_prod_benchmark_discovery.text", side_effect=lambda value: value):
                with patch(
                    "oneoff.build_discovery_prod_benchmark_discovery.recent_build_rows",
                    return_value=rows,
                ) as recent_rows:
                    report = discover_prod_benchmarks(
                        "postgresql://readonly",
                        sample_limit=25,
                        top_items=3,
                        statement_timeout_ms=1000,
                    )

        create_engine.assert_called_once_with("postgresql://readonly", pool_pre_ping=True)
        self.assertEqual(
            connection.execute.call_args_list[0].args,
            ("SET TRANSACTION READ ONLY",),
        )
        self.assertEqual(
            connection.execute.call_args_list[1].args,
            ("SET LOCAL statement_timeout = :timeout_ms", {"timeout_ms": 1000}),
        )
        connection.begin.assert_called_once_with()
        transaction_context.__enter__.assert_called_once_with()
        transaction_context.__exit__.assert_called_once()
        recent_rows.assert_called_once_with(connection, sample_limit=25, locale="en", class_name="Iop")
        engine.dispose.assert_called_once_with()
        self.assertEqual(report["reportVersion"], REPORT_VERSION)
        self.assertEqual(report["limits"]["sampleLimit"], 25)
        self.assertEqual(report["limits"]["minProfileSampleCount"], MIN_PROFILE_SAMPLE_COUNT)
        self.assertEqual(report["sample"]["rowCount"], 1)
        self.assertEqual(report["profiles"], [])

    def test_discover_prod_benchmarks_enforces_bounds_for_direct_callers(self):
        with self.assertRaises(ValueError):
            discover_prod_benchmarks(
                "postgresql://readonly",
                sample_limit=MAX_SAMPLE_LIMIT + 1,
            )

    def test_recent_build_rows_uses_bounded_query_params(self):
        connection = Mock()
        connection.execute.return_value = [
            {
                "custom_set_id": "set-1",
                "level": 200,
                "class_name": "Iop",
                "last_modified": datetime(2026, 7, 8),
                "strength_points": 0,
                "intelligence_points": 0,
                "chance_points": 0,
                "agility_points": 0,
                "ap": 4,
                "mp": 3,
                "range": 0,
                "item_strength": 0,
                "item_intelligence": 0,
                "item_chance": 0,
                "item_agility": 0,
                "equipped_item_names": [],
            }
        ]

        with patch("oneoff.build_discovery_prod_benchmark_discovery.create_engine", Mock()):
            with patch("oneoff.build_discovery_prod_benchmark_discovery.text", side_effect=lambda value: value):
                rows = recent_build_rows(connection, sample_limit=25, locale="en", class_name=None)

        query, params = connection.execute.call_args.args
        self.assertIn("LIMIT :sample_limit", query)
        self.assertNotIn("cs.name", query)
        self.assertEqual(params["sample_limit"], 25)
        self.assertEqual(params["locale"], "en")
        self.assertIsNone(params["class_name"])
        self.assertEqual(params["min_equipped_slot_count"], MIN_EQUIPPED_SLOT_COUNT)
        self.assertEqual(rows[0]["custom_set_id"], "set-1")


if __name__ == "__main__":
    unittest.main()
