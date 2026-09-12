from typing import Any
from pydantic import BaseModel, ConfigDict

class GovernmentUserBase(BaseModel):
    user_id: Any | None = None
    department: Any | None = None

class GovernmentUserCreate(GovernmentUserBase):
    pass

class GovernmentUserUpdate(GovernmentUserBase):
    pass

class GovernmentUserRead(GovernmentUserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
