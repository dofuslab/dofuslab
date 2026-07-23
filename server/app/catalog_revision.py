"""Transactional access to the singleton item/set catalog revision."""

from app.database.model_catalog_revision import ModelCatalogRevision


CATALOG_REVISION_ID = 1


def get_catalog_revision(db_session):
    """Read the current revision without retaining it in process memory."""
    row = (
        db_session.query(ModelCatalogRevision)
        .filter(ModelCatalogRevision.id == CATALOG_REVISION_ID)
        .one()
    )
    return row.revision


def advance_catalog_revision(db_session):
    """Increment and return the revision in the caller's transaction.

    The row lock prevents concurrent catalog syncs from losing an increment. The
    caller owns commit/rollback, keeping the revision atomic with catalog writes.
    """
    row = (
        db_session.query(ModelCatalogRevision)
        .filter(ModelCatalogRevision.id == CATALOG_REVISION_ID)
        .with_for_update()
        .one()
    )
    row.revision += 1
    db_session.flush()
    return row.revision


def advance_catalog_revision_for_changes(db_session, *change_groups):
    """Advance once when at least one supplied result collection has changes."""
    if any(change_groups):
        return advance_catalog_revision(db_session)
    return None
