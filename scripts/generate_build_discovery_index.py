"""Host wrapper for build-discovery index generation."""

from pathlib import Path
import sys

SERVER_DIR = Path(__file__).resolve().parents[1] / "server"
sys.path.insert(0, str(SERVER_DIR))

from oneoff.generate_build_discovery_index import main


if __name__ == "__main__":
    main()
