import boto3
from copy import deepcopy
import os
import traceback
from datetime import timedelta

from app import q, session_scope
from app.build_discovery_service import (
    BuildDiscoverySolveLockTimeout,
    CPSAT_SOLVER_VERSION,
    build_discovery_cached_response,
    build_discovery_query_from_payload,
    dataset_version,
)
from app.database.model_build_discovery_job import ModelBuildDiscoveryJob
from app.database.model_user import ModelUserAccount
from flask_babel import _


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


def mark_build_discovery_worker_cache_miss(response):
    result = deepcopy(response)
    result["cache"] = {
        **result.get("cache", {}),
        "status": "miss",
        "storage": "app_cache",
    }
    diagnostics = result.setdefault("diagnostics", {})
    diagnostics["appCacheHit"] = False
    return result


BUILD_DISCOVERY_RETRY_DELAYS_SECONDS = (1, 3, 8)


def run_build_discovery_job(job_id, retry_count=0):
    try:
        with session_scope() as db_session:
            job = db_session.query(ModelBuildDiscoveryJob).get(job_id)
            if job is None or job.status not in {"queued", "running"}:
                return False
            job.status = "running"
            job.progress = 10
            request_payload = job.request_payload

        query = build_discovery_query_from_payload(request_payload)
        try:
            response = build_discovery_cached_response(query)
        except BuildDiscoverySolveLockTimeout as error:
            retryable = retry_count < len(BUILD_DISCOVERY_RETRY_DELAYS_SECONDS)
            with session_scope() as db_session:
                job = db_session.query(ModelBuildDiscoveryJob).get(job_id)
                if job is None:
                    return False
                job.status = "queued" if retryable else "failed"
                job.progress = 0
                job.error_payload = {
                    "message": str(error),
                    "phase": "capacity",
                    "retryable": retryable,
                    "retryCount": retry_count,
                    "lockWaitMs": round(error.lock_wait_ms, 3),
                }
            if retryable:
                q.enqueue_in(
                    timedelta(
                        seconds=BUILD_DISCOVERY_RETRY_DELAYS_SECONDS[retry_count]
                    ),
                    run_build_discovery_job,
                    job_id,
                    retry_count + 1,
                )
            return False
        status = (
            "succeeded"
            if response.get("status", "complete") == "complete"
            else "failed"
        )

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
                job.solver_version = job.solver_version or CPSAT_SOLVER_VERSION
        raise
