from sqlalchemy.orm import Session
from . import model, schema
from typing import List


def get_all_user(db: Session, skip: int = 0, limit: int = 100):
    return db.query(model.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_name: str):
    return db.query(model.User).filter(model.User.user_name==user_name).first()

def create_user(db: Session, user: schema.UserSchema ):
    _user = model.User(user_name=user.user_name, password=user.password)
    db.add(_user)
    db.commit()
    db.refresh(_user)
    return _user

def update_history(db: Session, user_name: str, histories: List[str]):
    _user = get_user(db=db, user_name = user_name)

    _user.histories = histories

    db.commit()
    db.refresh(_user)
    return _user
