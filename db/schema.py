from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel , Field
from pydantic.generics import GenericModel

T = TypeVar('T')


class UserSchema(BaseModel):
    user_name: Optional[str] = None
    password: Optional[str] = None
    histories: Optional[List[str]] = None

    class Config:
        orm_mode = True


# class Request(GenericModel, Generic[T]):
#     parameter: Optional[T] = Field(...)


# class RequestUser(BaseModel):
#     parameter: UserSchema = Field(...)


class Response(GenericModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]
