import boto3
import os
import traceback

from app import cache_region, session_scope
from app.database.model_build_discovery_job import ModelBuildDiscoveryJob
from app.database.model_user import ModelUserAccount
from flask_babel import _
from oneoff.build_discovery_prototype import (
    BuildDiscoveryQuery,
    DEFAULT_MAX_SHARED_ITEMS,
    SOLVER_VERSION,
    build_discovery_response,
    dataset_version,
    query_cache_key,
)


def send_email(email, subject, content):
    with session_scope() as db_session:
        ses = boto3.client(
            "ses",
            region_name=os.getenv("SES_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        ses.send_email(
            Source=os.getenv("SES_EMAIL_SOURCE"),
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Html": {"Data": content}},
            },
        )
        user = db_session.query(ModelUserAccount).filter_by(email=email).one()
        user.email_sent = True
        return True


def build_discovery_query_from_payload(payload):
    query_payload = (payload or {}).get("queryIdentity") or (payload or {}).get("query") or {}
    return BuildDiscoveryQuery(
        class_name=query_payload.get("className", "Iop"),
        level=query_payload.get("level", 200),
        elements=tuple(query_payload.get("elements", ("strength",))),
        mode=query_payload.get("mode", "pvm"),
        ap_target=query_payload.get("apTarget", 11),
        mp_target=query_payload.get("mpTarget", 6),
        range_target=query_payload.get("rangeTarget", 0),
        damage_survivability_preset=query_payload.get("damageSurvivabilityPreset", 3),
        budget_tier=query_payload.get("budgetTier", 2),
        exo_policy=query_payload.get("exoPolicy", "allow"),
        weapon_policy=query_payload.get("weaponPolicy", "stat_stick_allowed"),
        locked_item_ids=tuple(query_payload.get("lockedItemIds", ())),
        avoided_item_ids=tuple(query_payload.get("avoidedItemIds", ())),
        limit=query_payload.get("limit", 5),
        top_k=query_payload.get("topK", 25),
        beam_width=query_payload.get("beamWidth", 250),
        per_signature_cap=query_payload.get("perSignatureCap", 40),
        relevant_set_limit=query_payload.get("relevantSetLimit", 60),
        max_shared_items=query_payload.get("maxSharedItems", DEFAULT_MAX_SHARED_ITEMS),
    )


def mark_build_discovery_worker_cache_miss(response):
    response = dict(response)
    response["cache"] = {
        "status": "miss",
        "storage": "app_cache",
    }
    response.setdefault("diagnostics", {})["appCacheHit"] = False
    return response


def build_discovery_app_cache_key(query):
    return "build_discovery_response:" + query_cache_key(query, dataset_version())


def run_build_discovery_job(job_id):
    try:
        with session_scope() as db_session:
            job = db_session.query(ModelBuildDiscoveryJob).get(job_id)
            if job is None or job.status not in {"queued", "running"}:
                return False
            job.status = "running"
            job.progress = 10
            request_payload = job.request_payload

        query = build_discovery_query_from_payload(request_payload)
        response = build_discovery_response(query, use_cache=False)
        response = mark_build_discovery_worker_cache_miss(response)
        cache_region.set(build_discovery_app_cache_key(query), response)
        status = "succeeded" if response.get("status", "complete") == "complete" else "failed"

        with session_scope() as db_session:
            job = db_session.query(ModelBuildDiscoveryJob).get(job_id)
            if job is None:
                return False
            job.status = status
            job.progress = 100 if status == "succeeded" else 0
            job.result_payload = response
            job.dataset_version = response.get("datasetVersion")
            job.solver_version = response.get("solverVersion")
            job.elapsed_ms = (response.get("diagnostics") or {}).get("elapsedMs")
            return status == "succeeded"
    except Exception as error:
        with session_scope() as db_session:
            job = db_session.query(ModelBuildDiscoveryJob).get(job_id)
            if job is not None:
                job.status = "failed"
                job.progress = 0
                job.error_payload = {
                    "message": str(error),
                    "traceback": traceback.format_exc(),
                }
                job.dataset_version = job.dataset_version or dataset_version()
                job.solver_version = job.solver_version or SOLVER_VERSION
        raise
