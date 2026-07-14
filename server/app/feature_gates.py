import atexit
import logging
import os
from threading import Lock
from time import monotonic

from flask_babel import _
from flask_login import current_user
from graphql import GraphQLError
from statsig_python_core import Statsig, StatsigOptions, StatsigUser


BUILD_GENERATOR_BETA_GATE = "build_generator_beta"
STATSIG_INIT_TIMEOUT_MS = 3000
STATSIG_RETRY_INTERVAL_SECONDS = 60

logger = logging.getLogger(__name__)

_statsig_client = None
_statsig_next_initialization_attempt_at = 0.0
_statsig_initialization_lock = Lock()


def _environment_tier():
    configured_tier = os.environ.get("STATSIG_ENVIRONMENT_TIER")
    if configured_tier:
        return configured_tier
    return (
        "development"
        if os.environ.get("FLASK_ENV") == "development"
        else "production"
    )


def _shutdown_client(client, reason):
    try:
        client.shutdown().wait()
    except Exception:
        logger.exception(
            "Statsig client shutdown failed", extra={"statsig_reason": reason}
        )


def initialize_statsig():
    """Initialize one Statsig client for the current server process."""
    global _statsig_client, _statsig_next_initialization_attempt_at

    if _statsig_client is not None:
        return True
    if monotonic() < _statsig_next_initialization_attempt_at:
        return False

    with _statsig_initialization_lock:
        if _statsig_client is not None:
            return True
        if monotonic() < _statsig_next_initialization_attempt_at:
            return False

        server_secret = os.environ.get("STATSIG_SERVER_SECRET")
        if not server_secret:
            logger.warning(
                "STATSIG_SERVER_SECRET is not configured; feature gates are disabled"
            )
            _statsig_next_initialization_attempt_at = float("inf")
            return False

        _statsig_next_initialization_attempt_at = (
            monotonic() + STATSIG_RETRY_INTERVAL_SECONDS
        )
        client = None
        try:
            options = StatsigOptions()
            options.environment = _environment_tier()
            options.init_timeout_ms = STATSIG_INIT_TIMEOUT_MS
            client = Statsig(server_secret, options)
            client.initialize().wait()
            details = client.get_initialize_details()
        except Exception:
            logger.exception(
                "Statsig initialization failed; feature gates remain disabled and will retry",
                extra={"statsig_retry_seconds": STATSIG_RETRY_INTERVAL_SECONDS},
            )
            if client is not None:
                _shutdown_client(client, "initialization_exception")
            return False

        if not details.is_config_spec_ready:
            logger.warning(
                "Statsig initialization returned without ready config specs; "
                "feature gates remain disabled and will retry",
                extra={
                    "statsig_init_success": details.init_success,
                    "statsig_init_source": details.source,
                    "statsig_retry_seconds": STATSIG_RETRY_INTERVAL_SECONDS,
                },
            )
            _shutdown_client(client, "config_specs_not_ready")
            return False

        _statsig_client = client
        _statsig_next_initialization_attempt_at = 0.0
        logger.info(
            "Statsig initialized with ready config specs",
            extra={
                "statsig_environment_tier": options.environment,
                "statsig_init_source": details.source,
                "statsig_init_duration_ms": details.duration_ms,
            },
        )
        return True


def shutdown_statsig():
    client = _statsig_client
    if client is None:
        return
    _shutdown_client(client, "process_shutdown")


atexit.register(shutdown_statsig)


def build_discovery_beta_enabled(user=None):
    user = current_user if user is None else user
    try:
        if not user.is_authenticated:
            return False
        if _statsig_client is None and not initialize_statsig():
            return False
        user_id = user.get_id()
        if not user_id:
            return False
        return bool(
            _statsig_client.check_gate(
                StatsigUser(
                    str(user_id),
                    private_attributes={"username": user.username},
                ),
                BUILD_GENERATOR_BETA_GATE,
            )
        )
    except Exception:
        logger.exception(
            "Statsig feature gate evaluation failed",
            extra={"statsig_gate": BUILD_GENERATOR_BETA_GATE},
        )
        return False


def require_build_discovery_beta():
    if not current_user.is_authenticated:
        raise GraphQLError(_("You are not logged in."))
    if not build_discovery_beta_enabled(current_user):
        raise GraphQLError(_("Build Discovery is not available."))
