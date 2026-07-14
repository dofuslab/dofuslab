import atexit
import logging
import os
from threading import Lock

from flask_babel import _
from flask_login import current_user
from graphql import GraphQLError
from statsig_python_core import Statsig, StatsigOptions, StatsigUser


BUILD_GENERATOR_BETA_GATE = "build_generator_beta"
STATSIG_INIT_TIMEOUT_MS = 3000

logger = logging.getLogger(__name__)

_statsig_client = None
_statsig_initialization_attempted = False
_statsig_initialization_lock = Lock()


def initialize_statsig():
    """Initialize one Statsig client for the current server process."""
    global _statsig_client, _statsig_initialization_attempted

    if _statsig_initialization_attempted:
        return _statsig_client is not None

    with _statsig_initialization_lock:
        if _statsig_initialization_attempted:
            return _statsig_client is not None
        _statsig_initialization_attempted = True

        server_secret = os.environ.get("STATSIG_SERVER_SECRET")
        if not server_secret:
            logger.warning(
                "STATSIG_SERVER_SECRET is not configured; feature gates are disabled"
            )
            return False

        try:
            options = StatsigOptions()
            options.environment = os.environ.get("FLASK_ENV", "production")
            options.init_timeout_ms = STATSIG_INIT_TIMEOUT_MS
            client = Statsig(server_secret, options)
            client.initialize().wait()
        except Exception:
            logger.exception("Statsig initialization failed; feature gates are disabled")
            return False

        _statsig_client = client
        return True


def shutdown_statsig():
    client = _statsig_client
    if client is None:
        return
    try:
        client.shutdown().wait()
    except Exception:
        pass


atexit.register(shutdown_statsig)


def build_discovery_beta_enabled(user=None):
    user = current_user if user is None else user
    try:
        if not user.is_authenticated or _statsig_client is None:
            return False
        user_id = user.get_id()
        if not user_id:
            return False
        return bool(
            _statsig_client.check_gate(
                StatsigUser(
                    str(user_id),
                    custom={"username": user.username},
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
