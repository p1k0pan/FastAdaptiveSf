import jwt

from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from typing import Optional
from pandas.core.internals.construction import algorithms

from sqlalchemy import text
from db import config, schema, crud, model
from sqlalchemy.orm import Session

key = "aDaPtIvE_sToRyFiNdEr_23"
algorithm = "HS256"

model.Base.metadata.create_all(bind=config.engine)
def get_db():
    db = config.SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_session = Depends(get_db)
app = FastAPI()

@app.get('/user')
async def get_user(skip: int = 0, limit: int = 100, db: Session =db_session):
    _users = crud.get_all_user(db, skip, limit)
    return schema.Response(status="Ok", code="200", message="Success fetch all data", result=_users)

def token_decode(token:str):
    try:
        # Verify the token's signature
        payload = jwt.decode(token, key, algorithms = [algorithm])

        # Check the token's expiration time
        current_time = datetime.utcnow()
        expiration_time = datetime.fromtimestamp(payload["exp"])

        if current_time > expiration_time:
            # Token has expired
            return ["Ok", '203', "Token is expired", "expired"]
        else:
            # Token is valid
            return ["Ok", '200', "Token is valid", payload["user_name"]]

    except jwt.ExpiredSignatureError as e:
        # Signature verification failed
        print(e)
        return ['Failed',"400", 'Signature verification failed. Token has expired.', None]
    except jwt.InvalidSignatureError as e:
        # Signature verification failed
        print(e)
        return ['Failed', '404', 'Signature verification failed. Token is invalid.', None]
    except jwt.DecodeError as e:
        # Token decoding failed
        print(e)
        return ['Failed', '500', 'Token decoding failed. Token is invalid.', None]
    except:
        print(token)
        return ['Failed', '500', 'Unknown', None]

@app.post("/token")
async def token_verif(request:Request):
    try:
        token = request.headers['authorization']
        status, code, msg, result = token_decode(token)
        return schema.Response(status=status, code=code, message=msg, result=result)
    except KeyError:
        return schema.Response(status="Failed", code='404', message="Token not found in Header", result=None)


# detect token, if not expire Response user, else require login
@app.post("/login")
async def login_to_create_token( user: schema.UserSchema, db: Session =db_session):
    _user = crud.get_user(db, user.user_name)
    if not _user:
        return schema.Response(status="Bad Request",
                    code="400",
                    message="Invalid user name or user not found", result=None)
    else:
        if _user.password !=user.password:
            return schema.Response(status="Bad Request",
                        code="400",
                        message="Invalid password", result=None)
        else:
            # assign a token
            token = create_token(_user.user_name)

            return schema.Response(status="Ok",
                        code="200",
                        message="login success", result=token)


def create_token(user_name:str):
    expiration = datetime.utcnow() + timedelta(hours=1)
    payload  ={"user_name":user_name, "exp": expiration}

    encoded = jwt.encode(payload, key, algorithm="HS256")

    # result = {"usaer_name": user.user_name, "header": request.headers['authorization']}
    return encoded

