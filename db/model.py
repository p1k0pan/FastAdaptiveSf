from sqlalchemy import  Column, String

from sqlalchemy.dialects.postgresql import JSONB

from . import config 

Base = config.Base

# db model
class User(Base):
    __tablename__ = "users"

    user_name = Column(String, primary_key=True)
    password = Column(String)
    histories = Column(JSONB)
