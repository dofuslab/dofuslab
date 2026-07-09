import unittest

from build_discovery_prod_benchmark_review_packet import (
    build_review_packet,
    prompt_for_profile,
)


def discovery_report():
    return {
        "reportVersion": "build-discovery-prod-benchmark-discovery-v1",
        "source": "prod_readonly_recent_custom_set_sample",
        "limits": {"sampleLimit": 500},
        "sample": {"rowCount": 100},
        "profiles": [
            {
                "className": "Cra",
                "element": "intelligence",
                "ap": 11,
                "mp": 6,
                "range": 6,
                "sampleCount": 20,
                "generatedQueryCandidate": {
                    "supported": False,
                    "unsupportedReasons": ["Build Discovery v1 currently supports Iop only."],
                },
                "commonItems": [{"name": "Example Bow", "sampleCount": 10}],
            },
            {
                "className": "Iop",
                "element": "strength",
                "ap": 12,
                "mp": 6,
                "range": 0,
                "sampleCount": 12,
                "generatedQueryCandidate": {
                    "supported": True,
                    "unsupportedReasons": [],
                    "query": {
                        "className": "Iop",
                        "level": 200,
                        "mode": "pvm",
                        "elements": ["strength"],
                        "apTarget": 12,
                        "mpTarget": 6,
                        "rangeTarget": 0,
                    },
                },
                "commonItems": [{"name": "Ochre Dofus", "sampleCount": 8}],
            },
            {
                "className": "Iop",
                "element": "agility",
                "ap": 11,
                "mp": 6,
                "range": 0,
                "sampleCount": 8,
                "generatedQueryCandidate": {
                    "supported": True,
                    "unsupportedReasons": [],
                    "query": {
                        "className": "Iop",
                        "level": 200,
                        "mode": "pvm",
                        "elements": ["agility"],
                        "apTarget": 11,
                        "mpTarget": 6,
                        "rangeTarget": 0,
                    },
                },
            },
        ],
    }


class BuildDiscoveryProdBenchmarkReviewPacketTest(unittest.TestCase):
    def test_prompt_for_profile_uses_profile_bucket(self):
        self.assertEqual(
            prompt_for_profile(
                {
                    "className": "Ecaflip",
                    "element": "strength",
                    "ap": 11,
                    "mp": 6,
                    "range": 1,
                }
            ),
            "200 strength Ecaflip 11/6/1",
        )

    def test_build_review_packet_splits_supported_and_future_prompts(self):
        packet = build_review_packet(discovery_report(), supported_limit=1, future_limit=1)

        self.assertEqual(
            packet["sourceReportVersion"],
            "build-discovery-prod-benchmark-discovery-v1",
        )
        self.assertEqual(packet["sample"], {"rowCount": 100})
        self.assertEqual(len(packet["supportedGeneratedBenchmarkPrompts"]), 1)
        self.assertEqual(
            packet["supportedGeneratedBenchmarkPrompts"][0]["prompt"],
            "200 strength Iop 12/6/0",
        )
        self.assertEqual(
            packet["supportedGeneratedBenchmarkPrompts"][0]["generatedQuery"]["apTarget"],
            12,
        )
        self.assertEqual(len(packet["futureBenchmarkPrompts"]), 1)
        self.assertEqual(
            packet["futureBenchmarkPrompts"][0]["prompt"],
            "200 intelligence Cra 11/6/6",
        )
        self.assertIn(
            "supports Iop only",
            " ".join(packet["futureBenchmarkPrompts"][0]["unsupportedReasons"]),
        )


if __name__ == "__main__":
    unittest.main()
