from typing import Any
from pydantic import BaseModel, ConfigDict

class TraineeBase(BaseModel):
    user_id: Any | None = None
    district_id: Any | None = None
    full_name: Any | None = None
    phone: Any | None = None
    date_of_birth: Any | None = None
    training_program_id: Any | None = None

class TraineeCreate(TraineeBase):
    pass

class TraineeUpdate(TraineeBase):
    pass

class TraineeRead(TraineeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
