from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
import os

db_uri = 'postgres+psycopg2://postgres:password@localhost:5432/dofus_sets'
engine = create_engine(db_uri, convert_unicode=True)

Base = declarative_base()
Base.metadata.bind = engine

db_session = scoped_session(sessionmaker(bind=engine, expire_on_commit=False))
Base.query = db_session.query_property()
