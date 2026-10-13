from database_url import normalize_database_url
from sqlalchemy import create_engine


def test_legacy_postgres_dialect_alias_is_normalized_without_changing_url_data():
    legacy = (
        "postgres+psycopg2://synthetic:p%40ss@db.invalid:5432/example"
        "?sslmode=require&application_name=dofuslab-test"
    )

    normalized = normalize_database_url(legacy)

    assert normalized == (
        "postgresql+psycopg2://synthetic:p%40ss@db.invalid:5432/example"
        "?sslmode=require&application_name=dofuslab-test"
    )
    engine = create_engine(normalized)
    assert engine.url.drivername == "postgresql+psycopg2"
    assert engine.url.username == "synthetic"
    assert engine.url.password == "p@ss"
    assert engine.url.host == "db.invalid"
    assert engine.url.database == "example"
    assert dict(engine.url.query) == {
        "sslmode": "require",
        "application_name": "dofuslab-test",
    }


def test_supported_postgresql_url_is_unchanged():
    supported = (
        "postgresql+psycopg2://synthetic:p%40ss@db.invalid:5432/example"
        "?sslmode=require&application_name=dofuslab-test"
    )

    assert normalize_database_url(supported) == supported
