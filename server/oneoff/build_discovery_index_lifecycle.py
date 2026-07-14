"""Lifecycle hooks for the derived Build Discovery game-data index."""

import os


def regenerate_build_discovery_index() -> None:
    if os.getenv("SKIP_BUILD_DISCOVERY_INDEX_REGEN") == "1":
        return

    from oneoff.generate_build_discovery_index import write_index

    print("\nRegenerating build discovery index...")
    write_index(source="db")
