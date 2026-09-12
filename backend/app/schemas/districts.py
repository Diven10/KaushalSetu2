from typing import Any
from pydantic import BaseModel, ConfigDict

class DistrictBase(BaseModel):
    name: Any | None = None

class DistrictCreate(DistrictBase):
    pass

class DistrictUpdate(DistrictBase):
    pass

class DistrictRead(DistrictBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
