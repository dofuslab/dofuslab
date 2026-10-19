"""Isolated tests for refresh-lock renewal."""

import importlib.util
from pathlib import Path
import threading
import unittest


MODULE_PATH = Path(__file__).parents[1] / "app" / "suggester" / "refresh_lock.py"
SPEC = importlib.util.spec_from_file_location(
    "suggestion_refresh_lock", str(MODULE_PATH)
)
refresh_lock = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(refresh_lock)


class FakeLock:
    def __init__(self, error=None):
        self.error = error
        self.reacquired = threading.Event()

    def reacquire(self):
        self.reacquired.set()
        if self.error is not None:
            raise self.error


class RefreshLockHeartbeatTests(unittest.TestCase):
    def test_renews_lock_until_stopped(self):
        lock = FakeLock()
        heartbeat = refresh_lock.RefreshLockHeartbeat(lock, 0.001)

        heartbeat.start()
        self.assertTrue(lock.reacquired.wait(1))
        heartbeat.stop()

        self.assertIsNone(heartbeat.error)

    def test_records_renewal_failure(self):
        lock = FakeLock(RuntimeError("simulated Redis outage"))
        heartbeat = refresh_lock.RefreshLockHeartbeat(lock, 0.001)

        heartbeat.start()
        self.assertTrue(lock.reacquired.wait(1))
        heartbeat.stop()

        self.assertRegex(str(heartbeat.error), "Redis outage")


if __name__ == "__main__":
    unittest.main()
