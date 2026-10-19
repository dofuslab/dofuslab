"""Background renewal for the recommendation refresh lock."""

import threading


class RefreshLockHeartbeat:
    """Keep a redis-py lock alive while synchronous training is running."""

    def __init__(self, refresh_lock, interval_seconds):
        self.refresh_lock = refresh_lock
        self.interval_seconds = interval_seconds
        self.error = None
        self._stop_event = threading.Event()
        self._thread = threading.Thread(target=self._run)
        self._thread.daemon = True

    def start(self):
        self._thread.start()

    def stop(self):
        self._stop_event.set()
        self._thread.join()

    def _run(self):
        while not self._stop_event.wait(self.interval_seconds):
            try:
                self.refresh_lock.reacquire()
            except Exception as error:
                self.error = error
                return
