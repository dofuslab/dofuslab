import os
import sys
import unittest
from pathlib import Path


SERVER_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))

from oneoff.build_discovery_core import BuildDiscoveryQuery  # noqa: E402
from oneoff.build_discovery_cpsat_runner import build_cpsat_args  # noqa: E402
from oneoff.build_discovery_cpsat_solver import solve_query  # noqa: E402


RUN_EXPENSIVE_REGRESSIONS = os.getenv("BUILD_DISCOVERY_EXPENSIVE_REGRESSION") == "1"
EXPENSIVE_REGRESSION_SCOPE = os.getenv("BUILD_DISCOVERY_EXPENSIVE_SCOPE", "all")


def expensive_scope(*scopes: str):
    return unittest.skipUnless(
        EXPENSIVE_REGRESSION_SCOPE == "all" or EXPENSIVE_REGRESSION_SCOPE in scopes,
        "set BUILD_DISCOVERY_EXPENSIVE_SCOPE=all or one of: " + ", ".join(scopes),
    )


@unittest.skipUnless(
    RUN_EXPENSIVE_REGRESSIONS,
    "set BUILD_DISCOVERY_EXPENSIVE_REGRESSION=1 to run expensive solver regressions",
)
class BuildDiscoveryExpensiveRegressionTest(unittest.TestCase):
    @expensive_scope("int-cra-budget")
    def test_intelligence_cra_nomarow_treadfast_budget_benchmark(self):
        core_item_ids = ("13641", "13642", "14094", "14095")
        expected_item_ids = {
            "13641",  # Nomarow's Helmet
            "13642",  # Nomarow's Ring
            "13762",  # Major Brainbox
            "13897",  # Shylock's Ring
            "14094",  # Treadfast Amulet
            "14095",  # Treadfast Belt
            "16204",  # Major Intellectual
            "16332",  # Major Vigour
            "16333",  # Shaker
            "16335",  # Nomad
            "18002",  # Merdiodon Cloak
            "26010",  # Imp Sword
            "30455",  # Arcanist
            "32121",  # Meriana's Clairvoyance
            "32224",  # Flasho's Flashy Shield
            "33282",  # Coral and Emerald Seemyool
        }
        query = BuildDiscoveryQuery(
            class_name="Cra",
            level=200,
            elements=("intelligence",),
            ap_target=11,
            mp_target=6,
            range_target=None,
            damage_survivability_preset=4,
            budget_tier=1,
            exo_policy="none",
            locked_item_ids=core_item_ids,
            limit=3,
        )
        args = build_cpsat_args(
            query,
            time_limit_seconds=12,
            workers=2,
            max_attempts=1,
            candidate_limit=10,
            output_build_limit=3,
        )

        response = solve_query(query, args)

        self.assertEqual(response["status"], "complete")
        best = response["builds"][0]
        self.assertGreaterEqual(best["score"], 2657.76)
        self.assertGreaterEqual(best["rawRotationDamageScore"], 1230.45)
        self.assertEqual(best["totals"]["AP"], 11)
        self.assertEqual(best["totals"]["MP"], 6)
        self.assertGreaterEqual(best["totals"]["Range"], 6)
        self.assertEqual(best["exos"], {})
        self.assertEqual(best["conditionFailures"], [])
        self.assertEqual(
            {item["id"] for item in best["items"].values()},
            expected_item_ids,
        )


if __name__ == "__main__":
    unittest.main()
