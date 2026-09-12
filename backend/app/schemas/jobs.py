from typing import Any
from pydantic import BaseModel, ConfigDict

class JobBase(BaseModel):
    employer_id: Any | None = None
    occupation_id: Any | None = None
    district_id: Any | None = None
    title: Any | None = None
    status: Any | None = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class JobRead(JobBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
