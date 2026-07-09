"""Host wrapper for the build-discovery benchmark report."""

from pathlib import Path
import sys

SERVER_DIR = Path(__file__).resolve().parents[1] / "server"
CONTAINER_SERVER_DIR = Path(__file__).resolve().parents[1]

for path in (SERVER_DIR, CONTAINER_SERVER_DIR):
    if (path / "oneoff").exists():
        sys.path.insert(0, str(path))
        break

from oneoff.build_discovery_benchmark_report import main


if __name__ == "__main__":
    main()
