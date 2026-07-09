import os
import sys
import unittest
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from oneoff.build_discovery_prototype import (  # noqa: E402
    SHAKER_TROPHY_ID,
    BuildDiscoveryQuery,
    build_discovery_response,
    clear_build_discovery_response_cache,
)


RUN_EXPENSIVE_REGRESSIONS = os.getenv("BUILD_DISCOVERY_EXPENSIVE_REGRESSION") == "1"


@unittest.skipUnless(
    RUN_EXPENSIVE_REGRESSIONS,
    "set BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 to run expensive no-cache solver regressions",
)
class BuildDiscoveryExpensiveRegressionTest(unittest.TestCase):
    def setUp(self):
        clear_build_discovery_response_cache()

    def assert_has_budget_build(
        self,
        response,
        *,
        min_ap: int = 11,
        min_mp: int = 6,
        min_primary_stat: int,
        primary_stat: str,
        min_score: float,
        expected_item_ids: set,
        expected_exos: Optional[dict] = None,
        required_item_id: Optional[str] = None,
    ):
        builds = response["builds"]
        self.assertGreater(len(builds), 0)

        best = builds[0]
        self.assertGreaterEqual(best["score"], min_score)
        self.assertGreaterEqual(best["totals"]["AP"], min_ap)
        self.assertGreaterEqual(best["totals"]["MP"], min_mp)
        self.assertGreaterEqual(best["totals"][primary_stat], min_primary_stat)
        self.assertEqual(best["exos"], expected_exos or {})
        self.assertEqual(best["conditionFailures"], [])
        self.assertEqual(
            {item["id"] for item in best["items"].values()},
            expected_item_ids,
        )

        if required_item_id:
            self.assertIn(
                required_item_id,
                {item["id"] for item in best["items"].values()},
            )

    def test_tier_one_strength_iop_11_6_no_exo_still_generates(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("strength",),
                ap_target=11,
                mp_target=6,
                range_target=0,
                budget_tier=1,
                exo_policy="none",
                limit=2,
            ),
            use_cache=False,
        )

        self.assert_has_budget_build(
            response,
            primary_stat="Strength",
            min_primary_stat=1200,
            min_score=2140.39,
            expected_item_ids={
                "31789",
                "19596",
                "31787",
                "30858",
                "14077",
                "17998",
                "19245",
                "14076",
                "14168",
                "33044",
                "16196",
                "16193",
                "16254",
                "16332",
                "16333",
                "16335",
            },
        )

    def test_tier_one_chance_iop_11_6_no_exo_still_generates(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("chance",),
                ap_target=11,
                mp_target=6,
                range_target=0,
                budget_tier=1,
                exo_policy="none",
                limit=2,
            ),
            use_cache=False,
        )

        self.assert_has_budget_build(
            response,
            primary_stat="Chance",
            min_primary_stat=800,
            min_score=2017.2,
            expected_item_ids={
                "16333",
                "14094",
                "15699",
                "31787",
                "18715",
                "19985",
                "18029",
                "18030",
                "15694",
                "18591",
                "33295",
                "16248",
                "16193",
                "16264",
                "16332",
                "16335",
            },
        )

    def test_tier_one_chance_iop_locked_shaker_still_generates(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("chance",),
                ap_target=11,
                mp_target=6,
                range_target=0,
                budget_tier=1,
                exo_policy="none",
                locked_item_ids=(SHAKER_TROPHY_ID,),
                limit=2,
            ),
            use_cache=False,
        )

        self.assert_has_budget_build(
            response,
            primary_stat="Chance",
            min_primary_stat=800,
            min_score=2017.2,
            expected_item_ids={
                "16333",
                "14094",
                "15699",
                "31787",
                "18715",
                "19985",
                "18029",
                "18030",
                "15694",
                "18591",
                "33295",
                "16248",
                "16193",
                "16264",
                "16332",
                "16335",
            },
            required_item_id=SHAKER_TROPHY_ID,
        )

    def test_opti_strength_iop_11_6_still_finds_benchmark_build(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("strength",),
                ap_target=11,
                mp_target=6,
                range_target=0,
                budget_tier=4,
                exo_policy="opti",
                limit=2,
            ),
            use_cache=False,
        )

        self.assert_has_budget_build(
            response,
            primary_stat="Strength",
            min_primary_stat=1400,
            min_score=2279.35,
            expected_item_ids={
                "15433",
                "15432",
                "18018",
                "18693",
                "13115",
                "17998",
                "13116",
                "15431",
                "14168",
                "33044",
                "7043",
                "22004",
                "694",
                "22020",
                "13344",
                "739",
            },
            expected_exos={
                "AP": {"itemId": "15432", "slot": "belt"},
                "MP": {"itemId": "15433", "slot": "amulet"},
            },
        )

    def test_opti_strength_iop_12_6_still_finds_benchmark_build(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("strength",),
                ap_target=12,
                mp_target=6,
                range_target=0,
                budget_tier=4,
                exo_policy="opti",
                limit=2,
            ),
            use_cache=False,
        )

        self.assert_has_budget_build(
            response,
            min_ap=12,
            primary_stat="Strength",
            min_primary_stat=1400,
            min_score=2320.43,
            expected_item_ids={
                "15433",
                "15432",
                "18018",
                "18693",
                "13115",
                "17998",
                "13116",
                "15431",
                "14168",
                "33044",
                "7043",
                "22004",
                "694",
                "22020",
                "7754",
                "6980",
            },
            expected_exos={
                "AP": {"itemId": "15432", "slot": "belt"},
            },
        )


if __name__ == "__main__":
    unittest.main()
