import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_discovery_cpsat_production_gate import nearest_rank, run_gate


class StepClock:
    def __init__(self, durations_ms):
        value = 0.0
        self.values = []
        for duration in durations_ms:
            self.values.extend((value, value + duration / 1000.0))
            value += duration / 1000.0
        self.index = 0

    def __call__(self):
        value = self.values[self.index]
        self.index += 1
        return value


def response(cache_status="miss", status="complete", solver="cpsat", errors=None):
    return {
        "data": {
            "buildDiscovery": {
                "status": status.upper(),
                "cache": {"status": cache_status},
                "cacheKey": "key",
                "solver": solver,
                "solverVersion": "cpsat-v1" if solver else None,
                "diagnostics": {"workers": 2, "ortoolsVersion": "9.12.4544"},
            }
        },
        **({"errors": errors} if errors else {}),
    }


class BuildDiscoveryCpsatProductionGateTest(unittest.TestCase):
    def test_nearest_rank_is_deterministic(self):
        self.assertEqual(nearest_rank(list(range(1, 101))), 95)
        self.assertEqual(nearest_rank(list(range(1, 20))), 19)

    def test_gate_runs_19_independent_misses_then_100_identical_hits(self):
        payloads = []

        def request(_url, payload, _timeout):
            payloads.append(payload)
            return response("miss" if len(payloads) <= 19 else "hit")

        report = run_gate(
            base_url="https://example.test", request_fn=request,
            clock=StepClock([3900] * 19 + [50] * 100), peak_rss_bytes=200 * 1024**2,
        )

        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["measurements"]["complete"], 19)
        self.assertEqual(report["measurements"]["coldWall"]["p95Ms"], 3900)
        self.assertEqual(report["measurements"]["warmMissWall"]["count"], 18)
        self.assertEqual(report["measurements"]["cacheHitWall"]["p95Ms"], 50)
        cold = [item["variables"]["input"] for item in payloads[:19]]
        warm = [item["variables"]["input"] for item in payloads[19:]]
        self.assertEqual(len({item["className"] for item in cold}), 19)
        self.assertTrue(all(item["resultLimit"] == 1 for item in cold))
        self.assertTrue(all(item == cold[0] for item in warm))

    def test_gate_records_status_errors_and_fails_thresholds_and_cache(self):
        calls = 0

        def request(_url, _payload, _timeout):
            nonlocal calls
            calls += 1
            if calls == 2:
                return response("hit", status="error", errors=[{"message": "solve failed"}])
            return response("miss" if calls <= 19 else "miss", solver=None)

        report = run_gate(
            base_url="http://localhost:5000", request_fn=request,
            clock=StepClock([5000] * 19 + [100] * 100), peak_rss_bytes=500 * 1024**2,
        )

        self.assertEqual(report["status"], "fail")
        self.assertEqual(report["coldRequests"][1]["errors"][0]["message"], "solve failed")
        self.assertTrue(any("19/19" in failure for failure in report["failures"]))
        self.assertTrue(any("cache miss" in failure for failure in report["failures"]))
        self.assertTrue(any("cache hits" in failure for failure in report["failures"]))
        self.assertTrue(any("solver must be cpsat" in failure for failure in report["failures"]))
        self.assertTrue(any("cold wall p95" in failure for failure in report["failures"]))
        self.assertTrue(any("warm cache-miss wall p95" in failure for failure in report["failures"]))
        self.assertTrue(any("cache-hit wall p95" in failure for failure in report["failures"]))
        self.assertTrue(any("peak RSS" in failure for failure in report["failures"]))

    def test_rejects_fewer_than_100_warm_requests(self):
        with self.assertRaisesRegex(ValueError, "at least 100"):
            run_gate(
                base_url="http://localhost", warm_requests=99,
                peak_rss_bytes=1,
            )


if __name__ == "__main__":
    unittest.main()
