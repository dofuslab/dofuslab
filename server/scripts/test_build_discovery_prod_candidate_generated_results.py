import unittest

from build_discovery_prod_candidate_generated_results import (
    build_prod_candidate_generated_results,
)


def discovery_report():
    return {
        "reportVersion": "build-discovery-prod-benchmark-discovery-v1",
        "profiles": [
            {
                "className": "Iop",
                "element": "strength",
                "ap": 11,
                "mp": 6,
                "range": 0,
                "sampleCount": 5,
                "commonItems": [{"name": "Crimson Dofus", "sampleCount": 4}],
                "generatedQueryCandidate": {
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
            },
            {
                "className": "Cra",
                "element": "intelligence",
                "ap": 11,
                "mp": 6,
                "range": 6,
                "sampleCount": 4,
                "generatedQueryCandidate": {
                    "supported": False,
                    "unsupportedReasons": ["Build Discovery v1 currently supports Iop only."],
                },
            },
        ],
    }


class BuildDiscoveryProdCandidateGeneratedResultsTest(unittest.TestCase):
    def test_build_prod_candidate_generated_results_runs_supported_candidates(self):
        seen_queries = []

        def fake_generator(query):
            seen_queries.append(query)
            return {
                "builds": [{"score": 1234.5}],
                "cache": {"status": "hit"},
                "diagnostics": {"elapsedMs": 1.2},
            }

        report = build_prod_candidate_generated_results(
            discovery_report(),
            candidate_limit=5,
            generator=fake_generator,
        )

        self.assertEqual(report["sourceReportVersion"], "build-discovery-prod-benchmark-discovery-v1")
        self.assertEqual(report["generatedCount"], 1)
        self.assertEqual(report["skippedCount"], 1)
        self.assertEqual(seen_queries[0].class_name, "Iop")
        self.assertEqual(seen_queries[0].elements, ("strength",))
        self.assertEqual(seen_queries[0].ap_target, 11)
        self.assertEqual(seen_queries[0].damage_survivability_preset, 2)
        self.assertEqual(seen_queries[0].budget_tier, 4)
        self.assertEqual(seen_queries[0].exo_policy, "opti")
        self.assertEqual(report["generatedCandidates"][0]["bestGeneratedScore"], 1234.5)
        self.assertEqual(report["generatedCandidates"][0]["commonItems"][0]["name"], "Crimson Dofus")
        self.assertEqual(report["skippedCandidates"][0]["status"], "unsupported")

    def test_build_prod_candidate_generated_results_enforces_candidate_limit(self):
        report = discovery_report()
        report["profiles"].insert(0, report["profiles"][0])

        result = build_prod_candidate_generated_results(
            report,
            candidate_limit=1,
            generator=lambda query: {"builds": []},
        )

        self.assertEqual(result["generatedCount"], 1)
        self.assertEqual(result["skippedCandidates"][0]["status"], "not_run")
        self.assertEqual(result["skippedCandidates"][0]["reason"], "candidate limit reached")

    def test_build_prod_candidate_generated_results_skips_malformed_supported_candidate(self):
        report = discovery_report()
        report["profiles"][0]["generatedQueryCandidate"] = {
            "supported": True,
            "unsupportedReasons": [],
            "query": {"className": "Iop"},
        }

        result = build_prod_candidate_generated_results(
            report,
            candidate_limit=5,
            generator=lambda query: {"builds": [{"score": 1}]},
        )

        self.assertEqual(result["generatedCount"], 0)
        self.assertEqual(result["skippedCandidates"][0]["status"], "malformed")
        self.assertIn("apTarget", result["skippedCandidates"][0]["missingQueryFields"])

    def test_build_prod_candidate_generated_results_allows_any_range_candidate(self):
        report = discovery_report()
        report["profiles"][0]["generatedQueryCandidate"]["query"]["rangeTarget"] = None
        seen_queries = []

        result = build_prod_candidate_generated_results(
            report,
            candidate_limit=5,
            generator=lambda query: seen_queries.append(query) or {"build": {"score": 42}},
        )

        self.assertEqual(result["generatedCount"], 1)
        self.assertIsNone(seen_queries[0].range_target)
        self.assertEqual(result["generatedCandidates"][0]["resultCount"], 1)
        self.assertEqual(result["generatedCandidates"][0]["bestGeneratedScore"], 42)

    def test_build_prod_candidate_generated_results_rejects_unbounded_limit(self):
        with self.assertRaises(ValueError):
            build_prod_candidate_generated_results(discovery_report(), candidate_limit=0)


if __name__ == "__main__":
    unittest.main()
