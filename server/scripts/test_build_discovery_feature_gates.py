import importlib
import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import Mock, patch

from graphql import GraphQLError


feature_gates = importlib.import_module("app.feature_gates")


class BuildDiscoveryFeatureGateTest(unittest.TestCase):
    def setUp(self):
        self.client = Mock()
        self.client_patch = patch.object(feature_gates, "_statsig_client", self.client)
        self.client_patch.start()
        self.addCleanup(self.client_patch.stop)
        self.user_id = uuid.uuid4()
        self.user = SimpleNamespace(
            is_authenticated=True,
            get_id=Mock(return_value=self.user_id),
            username="beta-tester",
        )

    def test_enabled_gate_uses_stable_database_user_id(self):
        statsig_user = object()
        self.client.check_gate.return_value = True
        with patch.object(
            feature_gates, "StatsigUser", return_value=statsig_user
        ) as user_type:
            enabled = feature_gates.build_discovery_beta_enabled(self.user)

        self.assertTrue(enabled)
        user_type.assert_called_once_with(
            str(self.user_id), custom={"username": "beta-tester"}
        )
        self.client.check_gate.assert_called_once_with(
            statsig_user, "build_generator_beta"
        )

    def test_disabled_gate_fails_closed(self):
        self.client.check_gate.return_value = False

        self.assertFalse(feature_gates.build_discovery_beta_enabled(self.user))

    def test_anonymous_user_fails_closed_without_evaluation(self):
        anonymous = SimpleNamespace(is_authenticated=False)

        self.assertFalse(feature_gates.build_discovery_beta_enabled(anonymous))
        self.client.check_gate.assert_not_called()

    def test_unconfigured_and_evaluation_errors_fail_closed(self):
        with patch.object(feature_gates, "_statsig_client", None):
            self.assertFalse(feature_gates.build_discovery_beta_enabled(self.user))

        self.client.check_gate.side_effect = RuntimeError("evaluation failed")
        self.assertFalse(feature_gates.build_discovery_beta_enabled(self.user))

    def test_anonymous_request_uses_existing_authentication_error(self):
        anonymous = SimpleNamespace(is_authenticated=False)
        with patch.object(feature_gates, "current_user", anonymous):
            with self.assertRaisesRegex(GraphQLError, "You are not logged in"):
                feature_gates.require_build_discovery_beta()


class StatsigInitializationTest(unittest.TestCase):
    def setUp(self):
        self.attempted_patch = patch.object(
            feature_gates, "_statsig_initialization_attempted", False
        )
        self.client_patch = patch.object(feature_gates, "_statsig_client", None)
        self.attempted_patch.start()
        self.client_patch.start()
        self.addCleanup(self.attempted_patch.stop)
        self.addCleanup(self.client_patch.stop)

    def test_missing_key_does_not_initialize(self):
        with patch.dict("os.environ", {}, clear=True), patch.object(
            feature_gates, "Statsig"
        ) as statsig_type:
            self.assertFalse(feature_gates.initialize_statsig())

        statsig_type.assert_not_called()

    def test_initialization_happens_only_once_per_process(self):
        client = Mock()
        with patch.dict(
            "os.environ",
            {
                "FLASK_ENV": "test",
                "STATSIG_SERVER_SECRET": "test-secret",
            },
            clear=True,
        ), patch.object(
            feature_gates, "Statsig", return_value=client
        ) as statsig_type, patch.object(
            feature_gates, "StatsigOptions"
        ) as options_type:
            options = options_type.return_value
            self.assertTrue(feature_gates.initialize_statsig())
            self.assertTrue(feature_gates.initialize_statsig())

        statsig_type.assert_called_once_with("test-secret", options)
        self.assertEqual(options.environment, "test")
        self.assertEqual(
            options.init_timeout_ms, feature_gates.STATSIG_INIT_TIMEOUT_MS
        )
        client.initialize.assert_called_once_with()
        client.initialize.return_value.wait.assert_called_once_with()

    def test_initialization_error_fails_closed(self):
        client = Mock()
        client.initialize.return_value.wait.side_effect = RuntimeError(
            "initialization failed"
        )
        with patch.dict(
            "os.environ", {"STATSIG_SERVER_SECRET": "test-secret"}, clear=True
        ), patch.object(feature_gates, "Statsig", return_value=client):
            self.assertFalse(feature_gates.initialize_statsig())

        self.assertIsNone(feature_gates._statsig_client)


if __name__ == "__main__":
    unittest.main()
