import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.build_discovery_cpsat_runner import (  # noqa: E402
    DEFAULT_FAST_CANDIDATE_LIMIT,
    add_cpsat_diagnostics,
    build_cpsat_args,
)
from oneoff.build_discovery_prototype import BuildDiscoveryQuery  # noqa: E402


class BuildDiscoveryCpsatRunnerTest(unittest.TestCase):
    def test_fast_args_keep_quality_candidate_buffer(self):
        args = build_cpsat_args(BuildDiscoveryQuery(limit=1))

        self.assertEqual(args.candidate_limit, DEFAULT_FAST_CANDIDATE_LIMIT)
        self.assertEqual(args.summary_limit, DEFAULT_FAST_CANDIDATE_LIMIT)
        self.assertEqual(args.output_build_limit, 1)
        self.assertEqual(args.collection_mode, "callback")
        self.assertFalse(args.stop_after_candidates)
        self.assertEqual(args.time_limit_seconds, 2.8)

    def test_candidate_limit_never_drops_below_requested_output_limit(self):
        args = build_cpsat_args(BuildDiscoveryQuery(limit=5), candidate_limit=3)

        self.assertEqual(args.candidate_limit, 5)
        self.assertEqual(args.summary_limit, 5)
        self.assertEqual(args.output_build_limit, 5)

    def test_add_cpsat_diagnostics_preserves_solver_metadata(self):
        response = {
            "solverStatus": "FEASIBLE",
            "timings": {"loadMs": 10.2, "totalSearchMs": 20.3},
            "requestedCandidateLimit": 3,
        }

        add_cpsat_diagnostics(response)

        self.assertEqual(response["solverVersion"], "oneoff.build_discovery_cpsat_experiment")
        self.assertEqual(response["diagnostics"]["solver"], "cpsat")
        self.assertEqual(response["diagnostics"]["elapsedMs"], 30.5)
        self.assertEqual(response["diagnostics"]["solverStatus"], "FEASIBLE")
        self.assertEqual(response["diagnostics"]["requestedCandidateLimit"], 3)


if __name__ == "__main__":
    unittest.main()
