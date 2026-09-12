from typing import Any
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    email: Any | None = None
    password_hash: Any | None = None
    role: Any | None = None

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass

class UserRead(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
