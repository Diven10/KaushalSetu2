from typing import Any
from pydantic import BaseModel, ConfigDict

class OccupationBase(BaseModel):
    name: Any | None = None
    category: Any | None = None

class OccupationCreate(OccupationBase):
    pass

class OccupationUpdate(OccupationBase):
    pass

class OccupationRead(OccupationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
