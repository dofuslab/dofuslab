"""Host wrapper for the build-discovery prototype."""

from pathlib import Path
import sys

SERVER_DIR = Path(__file__).resolve().parents[1] / "server"
sys.path.insert(0, str(SERVER_DIR))

from oneoff.build_discovery_prototype import main


if __name__ == "__main__":
    main()
