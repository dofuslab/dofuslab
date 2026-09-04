"""Format the persisted item/set catalog revision for clients."""


CATALOG_SCHEMA_VERSION = 2


def catalog_manifest(revision):
    """Return the stable wire representation for a database catalog revision."""
    return {
        "schemaVersion": CATALOG_SCHEMA_VERSION,
        "version": str(revision),
    }


def catalog_manifest_etag(manifest):
    """Include both wire schema and data revision in HTTP cache validation."""
    return "catalog-v{schemaVersion}-r{version}".format(**manifest)
