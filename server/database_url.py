def normalize_database_url(database_url):
    """Map the legacy PostgreSQL dialect alias without changing URL data."""
    legacy_scheme = "postgres+psycopg2://"
    if database_url and database_url.startswith(legacy_scheme):
        return "postgresql+psycopg2://" + database_url[len(legacy_scheme) :]
    return database_url
