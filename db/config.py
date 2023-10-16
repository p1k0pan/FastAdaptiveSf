from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = 'postgresql://admin:admin@localhost:5432/adaptive_storyfinder'
# DATABASE_URL = 'postgresql://admin:admin@postgres:5432/adaptive_storyfinder'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush = False, bind=engine)
Base = declarative_base()


