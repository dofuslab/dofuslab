"""Audit generated build data without mutating it."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

REPORT_VERSION = "generated-build-data-audit-v1"
LEGACY_GENERATED_NAME_PREFIX = "Generated%"
LEGACY_SAMPLE_LIMIT = 20


def age_bucket(created_at: datetime | None, now: datetime) -> str:
    if created_at is None:
        return "unknown"
    age = now - created_at
    if age < timedelta(days=1):
        return "lt_1d"
    if age < timedelta(days=7):
        return "1_to_7d"
    if age < timedelta(days=30):
        return "8_to_30d"
    return "gt_30d"


def rows_to_dicts(rows, keys: tuple[str, ...]) -> list[dict[str, Any]]:
    return [
        {
            key: serializable_value(value)
            for key, value in zip(keys, row)
        }
        for row in rows
    ]


def serializable_value(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    return value


def build_audit_report(
    *,
    generated_request_count: int,
    generated_custom_set_count: int,
    by_source_rows,
    by_source_version_rows,
    age_rows,
    orphan_generation_request_rows,
    duplicate_generation_request_rows,
    legacy_generated_name_count: int,
    legacy_generated_name_rows,
    now: datetime,
) -> dict[str, Any]:
    return {
        "reportVersion": REPORT_VERSION,
        "generatedAt": now.isoformat(),
        "mode": "audit_only",
        "summary": {
            "generatedRequestCount": generated_request_count,
            "generatedCustomSetCount": generated_custom_set_count,
            "orphanGenerationRequestCount": len(orphan_generation_request_rows),
            "customSetsWithMultipleGenerationRequestsCount": len(duplicate_generation_request_rows),
            "legacyGeneratedNameWithoutGenerationRequestCount": legacy_generated_name_count,
        },
        "bySource": rows_to_dicts(by_source_rows, ("source", "count")),
        "bySourceAndVersion": rows_to_dicts(
            by_source_version_rows,
            ("source", "datasetVersion", "solverVersion", "count"),
        ),
        "byAgeBucket": [
            {"bucket": bucket, "count": count}
            for bucket, count in sorted(age_rows, key=lambda row: row[0])
        ],
        "orphanGenerationRequests": rows_to_dicts(
            orphan_generation_request_rows,
            ("id", "customSetId", "source", "creationDate"),
        ),
        "customSetsWithMultipleGenerationRequests": rows_to_dicts(
            duplicate_generation_request_rows,
            ("customSetId", "count"),
        ),
        "legacyGeneratedNameWithoutGenerationRequestSamples": rows_to_dicts(
            legacy_generated_name_rows,
            ("customSetId", "name", "creationDate", "lastModified"),
        ),
        "notes": [
            "This report is read-only and does not delete or archive data.",
            "legacyGeneratedNameWithoutGenerationRequest uses generated-looking custom_set names as a heuristic for pre-provenance rows.",
        ],
    }


def missing_generation_request_table_report(now: datetime) -> dict[str, Any]:
    report = build_audit_report(
        generated_request_count=0,
        generated_custom_set_count=0,
        by_source_rows=[],
        by_source_version_rows=[],
        age_rows=[],
        orphan_generation_request_rows=[],
        duplicate_generation_request_rows=[],
        legacy_generated_name_count=0,
        legacy_generated_name_rows=[],
        now=now,
    )
    report["status"] = "generation_request_table_missing"
    report["notes"].append("generation_request table is missing; run migrations before generated provenance audits.")
    return report


def age_bucket_count_rows(db_session, generation_request_model, now: datetime):
    from sqlalchemy import func

    one_day_ago = now - timedelta(days=1)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)
    buckets = (
        (
            "unknown",
            generation_request_model.creation_date.is_(None),
        ),
        (
            "lt_1d",
            generation_request_model.creation_date > one_day_ago,
        ),
        (
            "1_to_7d",
            generation_request_model.creation_date <= one_day_ago,
            generation_request_model.creation_date > seven_days_ago,
        ),
        (
            "8_to_30d",
            generation_request_model.creation_date <= seven_days_ago,
            generation_request_model.creation_date > thirty_days_ago,
        ),
        (
            "gt_30d",
            generation_request_model.creation_date <= thirty_days_ago,
        ),
    )
    rows = []
    for bucket in buckets:
        bucket_name, *filters = bucket
        count = (
            db_session.query(func.count(generation_request_model.uuid))
            .filter(*filters)
            .scalar()
            or 0
        )
        if count:
            rows.append((bucket_name, count))
    return rows


def audit_generated_build_data(db_session, now: datetime | None = None) -> dict[str, Any]:
    from sqlalchemy import func, inspect

    from app.database.model_custom_set import ModelCustomSet
    from app.database.model_generation_request import ModelGenerationRequest

    now = now or datetime.utcnow()
    if ModelGenerationRequest.__tablename__ not in inspect(db_session.bind).get_table_names():
        return missing_generation_request_table_report(now)

    generated_request_count = db_session.query(func.count(ModelGenerationRequest.uuid)).scalar() or 0
    generated_custom_set_count = (
        db_session.query(func.count(func.distinct(ModelGenerationRequest.custom_set_id))).scalar()
        or 0
    )
    by_source_rows = (
        db_session.query(ModelGenerationRequest.source, func.count(ModelGenerationRequest.uuid))
        .group_by(ModelGenerationRequest.source)
        .order_by(ModelGenerationRequest.source)
        .all()
    )
    by_source_version_rows = (
        db_session.query(
            ModelGenerationRequest.source,
            ModelGenerationRequest.dataset_version,
            ModelGenerationRequest.solver_version,
            func.count(ModelGenerationRequest.uuid),
        )
        .group_by(
            ModelGenerationRequest.source,
            ModelGenerationRequest.dataset_version,
            ModelGenerationRequest.solver_version,
        )
        .order_by(
            ModelGenerationRequest.source,
            ModelGenerationRequest.dataset_version,
            ModelGenerationRequest.solver_version,
        )
        .all()
    )
    age_rows = age_bucket_count_rows(db_session, ModelGenerationRequest, now)

    orphan_generation_request_rows = (
        db_session.query(
            ModelGenerationRequest.uuid,
            ModelGenerationRequest.custom_set_id,
            ModelGenerationRequest.source,
            ModelGenerationRequest.creation_date,
        )
        .outerjoin(ModelCustomSet, ModelCustomSet.uuid == ModelGenerationRequest.custom_set_id)
        .filter(ModelCustomSet.uuid.is_(None))
        .order_by(ModelGenerationRequest.creation_date.desc())
        .limit(LEGACY_SAMPLE_LIMIT)
        .all()
    )
    duplicate_generation_request_rows = (
        db_session.query(
            ModelGenerationRequest.custom_set_id,
            func.count(ModelGenerationRequest.uuid).label("request_count"),
        )
        .group_by(ModelGenerationRequest.custom_set_id)
        .having(func.count(ModelGenerationRequest.uuid) > 1)
        .order_by(func.count(ModelGenerationRequest.uuid).desc())
        .limit(LEGACY_SAMPLE_LIMIT)
        .all()
    )
    legacy_base_query = (
        db_session.query(ModelCustomSet)
        .outerjoin(
            ModelGenerationRequest,
            ModelGenerationRequest.custom_set_id == ModelCustomSet.uuid,
        )
        .filter(ModelGenerationRequest.uuid.is_(None))
        .filter(ModelCustomSet.name.ilike(LEGACY_GENERATED_NAME_PREFIX))
    )
    legacy_generated_name_count = legacy_base_query.count()
    legacy_generated_name_rows = (
        legacy_base_query.with_entities(
            ModelCustomSet.uuid,
            ModelCustomSet.name,
            ModelCustomSet.creation_date,
            ModelCustomSet.last_modified,
        )
        .order_by(ModelCustomSet.last_modified.desc())
        .limit(LEGACY_SAMPLE_LIMIT)
        .all()
    )

    return build_audit_report(
        generated_request_count=generated_request_count,
        generated_custom_set_count=generated_custom_set_count,
        by_source_rows=by_source_rows,
        by_source_version_rows=by_source_version_rows,
        age_rows=age_rows,
        orphan_generation_request_rows=orphan_generation_request_rows,
        duplicate_generation_request_rows=duplicate_generation_request_rows,
        legacy_generated_name_count=legacy_generated_name_count,
        legacy_generated_name_rows=legacy_generated_name_rows,
        now=now,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", help="Write audit report JSON to this path instead of stdout.")
    args = parser.parse_args()

    from app import session_scope

    with session_scope() as db_session:
        report = audit_generated_build_data(db_session)

    output = json.dumps(report, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(output)
            file.write("\n")
    else:
        print(output)


if __name__ == "__main__":
    main()
