#!/usr/bin/env python3
"""Validate the production Build Discovery index, generating it once if needed."""

from __future__ import annotations

import json
import os
import sys
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Callable, Iterator

from oneoff.generate_build_discovery_index import (
    BuildDiscoveryIndexValidationError,
    default_output_path,
    validate_build_discovery_index,
    write_index,
)

LOCK_TIMEOUT_SECONDS = 300
STALE_LOCK_SECONDS = 300


def validate_path(path: str) -> None:
    try:
        with open(path, encoding="utf-8") as file:
            index = json.load(file)
    except FileNotFoundError as exc:
        raise BuildDiscoveryIndexValidationError(f"index is absent at {path}") from exc
    except (OSError, json.JSONDecodeError) as exc:
        raise BuildDiscoveryIndexValidationError(f"index at {path} is unreadable: {exc}") from exc
    validate_build_discovery_index(index)


@contextmanager
def generation_lock(path: str) -> Iterator[None]:
    lock_path = f"{path}.startup.lock"
    deadline = time.monotonic() + LOCK_TIMEOUT_SECONDS
    while True:
        try:
            fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, f"pid={os.getpid()} created={time.time()}\n".encode("ascii"))
            os.close(fd)
            break
        except FileExistsError:
            try:
                lock_age = time.time() - os.path.getmtime(lock_path)
                if lock_age > STALE_LOCK_SECONDS:
                    os.unlink(lock_path)
                    continue
            except FileNotFoundError:
                continue
            if time.monotonic() >= deadline:
                raise RuntimeError(f"timed out waiting for Build Discovery index lock {lock_path}")
            time.sleep(0.1)
    try:
        yield
    finally:
        Path(lock_path).unlink(missing_ok=True)


def ensure_index(
    path: str | None = None,
    *,
    generate: Callable[..., object] = write_index,
) -> bool:
    path = path or os.getenv("BUILD_DISCOVERY_INDEX_PATH") or default_output_path()
    try:
        validate_path(path)
        print(f"Build Discovery index is complete at {path}; generation skipped.")
        return False
    except BuildDiscoveryIndexValidationError as initial_error:
        print(f"Build Discovery index requires regeneration: {initial_error}")

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with generation_lock(path):
        try:
            validate_path(path)
            print(f"Build Discovery index became ready at {path}; generation skipped.")
            return False
        except BuildDiscoveryIndexValidationError:
            generate(path, source="db")
        validate_path(path)
    print(f"Build Discovery index regenerated and validated at {path}.")
    return True


def main() -> None:
    try:
        ensure_index()
    except Exception as exc:
        print(f"Build Discovery startup validation failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
