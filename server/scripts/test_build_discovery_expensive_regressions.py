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
EXPENSIVE_REGRESSION_SCOPE = os.getenv("BUILD_DISCOVERY_EXPENSIVE_SCOPE", "all")

# Examples:
#   BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 python -m unittest scripts.test_build_discovery_expensive_regressions
#   BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 BUILD_DISCOVERY_EXPENSIVE_SCOPE=str-opti python -m unittest scripts.test_build_discovery_expensive_regressions
#   BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 BUILD_DISCOVERY_EXPENSIVE_SCOPE=agi-opti python -m unittest scripts.test_build_discovery_expensive_regressions
#   BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 BUILD_DISCOVERY_EXPENSIVE_SCOPE=agi-budget python -m unittest scripts.test_build_discovery_expensive_regressions
#   BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 BUILD_DISCOVERY_EXPENSIVE_SCOPE=budget python -m unittest scripts.test_build_discovery_expensive_regressions


def expensive_scope(*scopes: str):
    return unittest.skipUnless(
        EXPENSIVE_REGRESSION_SCOPE == "all" or EXPENSIVE_REGRESSION_SCOPE in scopes,
        "set BUILD_DISCOVERY_EXPENSIVE_SCOPE=all or one of: " + ", ".join(scopes),
    )


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

    @expensive_scope("budget")
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

    @expensive_scope("budget", "agi-budget")
    def test_tier_one_agility_iop_12_6_no_exo_still_finds_budget_benchmark(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("agility",),
                ap_target=12,
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
            min_ap=12,
            primary_stat="Agility",
            min_primary_stat=900,
            min_score=1940.16,
            expected_item_ids={
                "13786",
                "15696",
                "15698",
                "15701",
                "16193",
                "16245",
                "16267",
                "16332",
                "16333",
                "19599",
                "20360",
                "24035",
                "31790",
                "32121",
                "32245",
                "33023",
            },
        )

    @expensive_scope("budget")
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

    @expensive_scope("budget")
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

    @expensive_scope("str-opti")
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
            min_score=2377.27,
            expected_item_ids={
                "13344",
                "19244",
                "19245",
                "19246",
                "22020",
                "22205",
                "22206",
                "22209",
                "30858",
                "31798",
                "31800",
                "33044",
                "694",
                "739",
                "7043",
                "8698",
            },
            expected_exos={
                "AP": {"itemId": "22209", "slot": "belt"},
                "MP": {"itemId": "19244", "slot": "amulet"},
            },
        )

    @expensive_scope("str-opti")
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
            min_score=2472.48,
            expected_item_ids={
                "13344",
                "19244",
                "19245",
                "19246",
                "22020",
                "22205",
                "22206",
                "22209",
                "30858",
                "31798",
                "31800",
                "33044",
                "694",
                "7043",
                "7754",
                "8698",
            },
            expected_exos={
                "AP": {"itemId": "22209", "slot": "belt"},
                "MP": {"itemId": "19244", "slot": "amulet"},
            },
        )

    @expensive_scope("agi-opti")
    def test_opti_agility_iop_12_6_still_finds_benchmark_build(self):
        response = build_discovery_response(
            BuildDiscoveryQuery(
                elements=("agility",),
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
            primary_stat="Agility",
            min_primary_stat=1300,
            min_score=2399.88,
            expected_item_ids={
                "13344",
                "14082",
                "14083",
                "14092",
                "14093",
                "18718",
                "19599",
                "19601",
                "19606",
                "22020",
                "24035",
                "694",
                "7043",
                "7709",
                "7754",
                "8698",
            },
            expected_exos={
                "AP": {"itemId": "19599", "slot": "belt"},
                "MP": {"itemId": "14083", "slot": "amulet"},
            },
        )


if __name__ == "__main__":
    unittest.main()
