from typing import Any
from pydantic import BaseModel, ConfigDict

class TrainingProviderBase(BaseModel):
    name: Any | None = None
    district_id: Any | None = None

class TrainingProviderCreate(TrainingProviderBase):
    pass

class TrainingProviderUpdate(TrainingProviderBase):
    pass

class TrainingProviderRead(TrainingProviderBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
