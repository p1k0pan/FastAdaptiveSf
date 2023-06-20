from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, ARRAY
from sqlalchemy.orm import relationship

from . import config 

Base = config.Base

class User(Base):
    __tablename__ = "users"

    user_name = Column(String, primary_key=True)
    password = Column(String)
    histories = Column(ARRAY(String))
