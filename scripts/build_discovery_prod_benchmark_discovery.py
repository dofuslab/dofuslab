"""Host wrapper for bounded prod Build Discovery benchmark discovery."""

from __future__ import annotations

import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SERVER = ROOT / "server"
sys.path.insert(0, str(SERVER))

os.environ.setdefault("PYTHONPATH", str(SERVER))

from oneoff.build_discovery_prod_benchmark_discovery import main


if __name__ == "__main__":
    main()
