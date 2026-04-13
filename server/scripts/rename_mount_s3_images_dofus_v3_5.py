"""
Rename mount item images on S3 after Dofus v3.5 mount ID migration.

Two modes:

1. Default: copies item/<old_id>.png -> item/<new_id>.png using MOUNT_UPGRADE_DICT
   from the Alembic migration.

2. --from-mounts-json: copies item/<mountDofusID>.png -> <imageUrl> from
   app/database/data/mounts.json (after IDs were aligned to mountDofusID).
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
import types
from pathlib import Path

DEFAULT_BUCKET = os.environ.get("DOFUSLAB_S3_BUCKET", "dofus-lab")
ITEM_PREFIX = "item"
MIGRATION_FILENAME = "1cb498f44c5b_mount_id_migration_for_dofus_v3_5.py"


def _server_dir() -> Path:
    return Path(__file__).resolve().parent.parent


def _load_mount_upgrade_dict():
    server_dir = _server_dir()
    migration_path = (
        server_dir
        / "app"
        / "migrations"
        / "versions"
        / MIGRATION_FILENAME
    )
    if not migration_path.is_file():
        raise FileNotFoundError(f"Migration not found: {migration_path}")

    # Migration imports alembic/sqlalchemy; only upgrade() uses them — stub so
    # this script runs without the full server venv (mapping is plain data).
    if "alembic" not in sys.modules:
        alembic_mod = types.ModuleType("alembic")
        alembic_mod.op = types.SimpleNamespace()
        sys.modules["alembic"] = alembic_mod
    if "sqlalchemy" not in sys.modules:
        sys.modules["sqlalchemy"] = types.ModuleType("sqlalchemy")

    spec = importlib.util.spec_from_file_location(
        "mount_id_migration_dofus_v3_5", migration_path
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.MOUNT_UPGRADE_DICT


def _load_mounts_json_pairs(mounts_path: Path | None = None) -> list[tuple[str, str]]:
    """Map item/<mountDofusID>.png -> imageUrl keys from mounts.json."""
    server_dir = _server_dir()
    path = mounts_path or (server_dir / "app" /
                           "database" / "data" / "mounts.json")
    if not path.is_file():
        raise FileNotFoundError(f"mounts.json not found: {path}")

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    pairs: list[tuple[str, str]] = []
    for row in data:
        mid = str(row["mountDofusID"]).strip()
        dest = str(row["imageUrl"]).strip().lstrip("/")
        src = f"{ITEM_PREFIX}/{mid}.png"
        if src != dest:
            pairs.append((src, dest))

    pairs.sort(key=lambda x: x[0])
    return pairs


def _object_exists(s3, bucket: str, key: str) -> bool:
    from botocore.exceptions import ClientError

    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("404", "NoSuchKey", "NotFound"):
            return False
        status = e.response.get("ResponseMetadata", {}).get("HTTPStatusCode")
        if status == 404:
            return False
        raise


def _copy_and_delete(s3, bucket: str, src: str, dest: str) -> None:
    s3.copy_object(
        Bucket=bucket,
        Key=dest,
        CopySource={"Bucket": bucket, "Key": src},
        ACL="public-read",
    )
    s3.delete_object(Bucket=bucket, Key=src)


def _run_s3_moves(
    bucket: str,
    pairs: list[tuple[str, str]],
    *,
    dry_run: bool,
    skip_existing: bool,
    overwrite: bool,
) -> int:
    if dry_run:
        for src, dest in pairs:
            print(
                f"[dry-run] copy s3://{bucket}/{src} -> s3://{bucket}/{dest}")
            print(f"[dry-run] delete s3://{bucket}/{src}")
        print(f"[dry-run] done ({len(pairs)} pairs).")
        return 0

    import boto3
    from botocore.exceptions import ClientError

    s3 = boto3.client("s3")
    copied = 0
    skipped_missing = 0
    skipped_dest = 0
    errors = 0

    for src, dest in pairs:
        try:
            if not _object_exists(s3, bucket, src):
                print(f"WARN: missing source, skip: s3://{bucket}/{src}")
                skipped_missing += 1
                continue

            if (
                skip_existing
                and not overwrite
                and _object_exists(s3, bucket, dest)
            ):
                print(f"SKIP: destination exists: s3://{bucket}/{dest}")
                skipped_dest += 1
                continue

            _copy_and_delete(s3, bucket, src, dest)
            print(f"OK: {src} -> {dest} (moved)")
            copied += 1
        except ClientError as e:
            print(
                f"ERROR: {src} -> {dest}: {e.response.get('Error', e)}",
                file=sys.stderr,
            )
            errors += 1
        except Exception as e:
            print(f"ERROR: {src} -> {dest}: {e}", file=sys.stderr)
            errors += 1

    print(
        f"Summary: copied={copied}, skipped_missing={skipped_missing}, "
        f"skipped_dest={skipped_dest}, errors={errors}"
    )
    return 1 if errors else 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Rename/move mount PNGs on S3 (migration mapping or mounts.json)."
    )
    parser.add_argument(
        "--from-mounts-json",
        action="store_true",
        help=(
            "Use mounts.json: move item/<mountDofusID>.png to each row's imageUrl "
            "(after the migration script keyed files by mount ID)."
        ),
    )
    parser.add_argument(
        "--mounts-json-path",
        type=Path,
        default=None,
        help="Override path to mounts.json (default: app/database/data/mounts.json).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned copy/delete only; no S3 calls.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="If destination key already exists, skip (and do not delete source).",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="When combined with --skip-existing, still copy over an existing destination.",
    )
    parser.add_argument(
        "--bucket",
        default=DEFAULT_BUCKET,
        help=f"S3 bucket (default: {DEFAULT_BUCKET!r}, or DOFUSLAB_S3_BUCKET).",
    )
    args = parser.parse_args()
    bucket = args.bucket

    try:
        if args.from_mounts_json:
            pairs = _load_mounts_json_pairs(args.mounts_json_path)
            print(f"Loaded {len(pairs)} src/dest pairs from mounts.json.")
        else:
            mount_map = _load_mount_upgrade_dict()
            pairs = [
                (f"{ITEM_PREFIX}/{old}.png", f"{ITEM_PREFIX}/{new}.png")
                for old, new in sorted(mount_map.items(), key=lambda x: x[0])
            ]
            print(f"Loaded {len(pairs)} mount ID pairs from migration.")
    except Exception as e:
        print(f"Failed to load mapping: {e}", file=sys.stderr)
        return 1

    return _run_s3_moves(
        bucket,
        pairs,
        dry_run=args.dry_run,
        skip_existing=args.skip_existing,
        overwrite=args.overwrite,
    )


if __name__ == "__main__":
    sys.exit(main())
