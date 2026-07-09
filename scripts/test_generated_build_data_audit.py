import unittest
from datetime import datetime, timedelta
from pathlib import Path
import sys
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))

from oneoff.generated_build_data_audit import (
    REPORT_VERSION,
    age_bucket,
    build_audit_report,
    missing_generation_request_table_report,
)


class GeneratedBuildDataAuditTest(unittest.TestCase):
    def test_age_bucket_boundaries(self):
        now = datetime(2026, 7, 9, 12, 0, 0)

        self.assertEqual(age_bucket(None, now), "unknown")
        self.assertEqual(age_bucket(now - timedelta(hours=23), now), "lt_1d")
        self.assertEqual(age_bucket(now - timedelta(days=3), now), "1_to_7d")
        self.assertEqual(age_bucket(now - timedelta(days=20), now), "8_to_30d")
        self.assertEqual(age_bucket(now - timedelta(days=45), now), "gt_30d")

    def test_build_audit_report_is_read_only_and_summarizes_integrity_findings(self):
        now = datetime(2026, 7, 9, 12, 0, 0)
        orphan_created = now - timedelta(days=2)
        legacy_created = now - timedelta(days=20)
        request_id = uuid.uuid4()
        missing_custom_set_id = uuid.uuid4()
        duplicate_custom_set_id = uuid.uuid4()
        legacy_custom_set_id = uuid.uuid4()
        report = build_audit_report(
            generated_request_count=3,
            generated_custom_set_count=2,
            by_source_rows=[
                ("build_discovery", 2),
                ("build_discovery_oneoff_import", 1),
            ],
            by_source_version_rows=[
                ("build_discovery", "dataset-v1", "solver-v1", 2),
            ],
            age_rows=[
                ("gt_30d", 1),
                ("lt_1d", 2),
            ],
            orphan_generation_request_rows=[
                (request_id, missing_custom_set_id, "build_discovery", orphan_created),
            ],
            duplicate_generation_request_rows=[
                (duplicate_custom_set_id, 2),
            ],
            legacy_generated_name_count=4,
            legacy_generated_name_rows=[
                (legacy_custom_set_id, "Generated Strength Iop #1", legacy_created, now),
            ],
            now=now,
        )

        self.assertEqual(report["reportVersion"], REPORT_VERSION)
        self.assertEqual(report["mode"], "audit_only")
        self.assertEqual(
            report["summary"],
            {
                "generatedRequestCount": 3,
                "generatedCustomSetCount": 2,
                "orphanGenerationRequestCount": 1,
                "customSetsWithMultipleGenerationRequestsCount": 1,
                "legacyGeneratedNameWithoutGenerationRequestCount": 4,
            },
        )
        self.assertEqual(
            report["bySource"],
            [
                {"source": "build_discovery", "count": 2},
                {"source": "build_discovery_oneoff_import", "count": 1},
            ],
        )
        self.assertEqual(
            report["orphanGenerationRequests"][0]["creationDate"],
            orphan_created.isoformat(),
        )
        self.assertEqual(report["orphanGenerationRequests"][0]["id"], str(request_id))
        self.assertEqual(
            report["orphanGenerationRequests"][0]["customSetId"],
            str(missing_custom_set_id),
        )
        self.assertEqual(
            report["customSetsWithMultipleGenerationRequests"][0]["customSetId"],
            str(duplicate_custom_set_id),
        )
        self.assertEqual(
            report["legacyGeneratedNameWithoutGenerationRequestSamples"][0],
            {
                "customSetId": str(legacy_custom_set_id),
                "name": "Generated Strength Iop #1",
                "creationDate": legacy_created.isoformat(),
                "lastModified": now.isoformat(),
            },
        )
        self.assertIn("read-only", report["notes"][0])

    def test_missing_generation_request_table_report_is_explicit(self):
        now = datetime(2026, 7, 9, 12, 0, 0)

        report = missing_generation_request_table_report(now)

        self.assertEqual(report["status"], "generation_request_table_missing")
        self.assertEqual(report["summary"]["generatedRequestCount"], 0)
        self.assertIn("generation_request table is missing", report["notes"][-1])


if __name__ == "__main__":
    unittest.main()
