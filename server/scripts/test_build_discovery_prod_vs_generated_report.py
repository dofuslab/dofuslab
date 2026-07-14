import argparse
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_discovery_prod_vs_generated_report import (
    ProductionBuild,
    common_queries,
    percentile,
    validate_args,
)
from oneoff.build_discovery_core import BuildState, configure_damage_profile, target_level_context


class BuildDiscoveryProdVsGeneratedReportTest(unittest.TestCase):
    def test_common_queries_uses_source_class_for_query_but_not_source_filtering(self):
        with target_level_context(200):
            configure_damage_profile("strength", "Iop")
            state = BuildState(stats={"AP": 12, "MP": 6, "Strength": 900})
            build = ProductionBuild(source_class="Cra", slots=())

            queries = common_queries([(build, state)], limit=100)

        self.assertEqual(len(queries), 1)
        query, source_count = queries[0]
        self.assertEqual(query.class_name, "Cra")
        self.assertEqual(query.primary_element, "strength")
        self.assertEqual((query.ap_target, query.mp_target), (12, 6))
        self.assertEqual(source_count, 1)

    def test_percentile_counts_equal_scores(self):
        self.assertEqual(percentile(20, [10, 20, 30]), 66.67)

    def test_validate_args_rejects_more_than_one_hundred_queries(self):
        args = argparse.Namespace(
            build_sample_limit=100,
            query_limit=101,
            statement_timeout_ms=1000,
            solver_time_limit_seconds=3.2,
            solver_workers=2,
        )
        with self.assertRaises(ValueError):
            validate_args(args)


if __name__ == "__main__":
    unittest.main()
