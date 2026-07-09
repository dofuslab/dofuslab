"""Host wrapper for build-discovery index generation."""

from pathlib import Path
import sys

SERVER_DIR = Path(__file__).resolve().parents[1] / "server"
CONTAINER_SERVER_DIR = Path(__file__).resolve().parents[1]

for path in (SERVER_DIR, CONTAINER_SERVER_DIR):
    if (path / "oneoff").exists():
        sys.path.insert(0, str(path))
        break

from oneoff.generate_build_discovery_index import main


if __name__ == "__main__":
    main()
