from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
import os

db_name = 'database.db'
db_path = os.path.join(os.path.dirname(__file__), db_name)
db_uri = 'sqlite:///{}'.format(db_path)
engine = create_engine(db_uri, convert_unicode=True)

Base = declarative_base()
Base.metadata.bind = engine

db_session = scoped_session(sessionmaker(bind=engine, expire_on_commit=False))
Base.query = db_session.query_property()
