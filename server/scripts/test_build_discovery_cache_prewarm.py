import importlib.util
import unittest
from pathlib import Path


def load_prewarm_module():
    module_path = Path(__file__).resolve().parent / "build_discovery_cache_prewarm.py"
    spec = importlib.util.spec_from_file_location(
        "build_discovery_cache_prewarm",
        module_path,
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class BuildDiscoveryCachePrewarmTest(unittest.TestCase):
    def test_prewarm_query_matrix_reports_supported_profiles(self):
        module = load_prewarm_module()
        seen = []

        def fake_prewarm(query):
            seen.append((query.elements, query.ap_target))
            return {
                "cacheKey": f"{query.elements[0]}-{query.ap_target}",
                "cache": {"status": "miss", "storage": "app_cache"},
                "diagnostics": {"appCacheHit": False, "resultCount": 2},
            }

        report = module.prewarm_query_matrix(
            fake_prewarm,
            elements=("strength", "chance"),
        )

        self.assertEqual(report["reportVersion"], module.REPORT_VERSION)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["summary"], {
            "rowCount": 4,
            "cacheHits": 0,
            "cacheMisses": 4,
            "emptyResults": 0,
        })
        self.assertEqual(
            seen,
            [
                (("strength",), 11),
                (("chance",), 11),
                (("strength",), 12),
                (("chance",), 12),
            ],
        )
        self.assertEqual(report["rows"][0]["cacheStorage"], "app_cache")

    def test_prewarm_query_matrix_fails_on_empty_results(self):
        module = load_prewarm_module()

        report = module.prewarm_query_matrix(
            lambda query: {
                "cache": {"status": "hit", "storage": "app_cache"},
                "diagnostics": {"appCacheHit": True, "resultCount": 0},
            },
            elements=("strength",),
        )

        self.assertEqual(report["status"], "fail")
        self.assertEqual(report["summary"]["emptyResults"], 2)
        self.assertEqual(report["summary"]["cacheHits"], 2)


if __name__ == "__main__":
    unittest.main()
