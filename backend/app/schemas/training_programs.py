from typing import Any
from pydantic import BaseModel, ConfigDict

class TrainingProgramBase(BaseModel):
    training_provider_id: Any | None = None
    name: Any | None = None
    duration_weeks: Any | None = None
    primary_skill_id: Any | None = None

class TrainingProgramCreate(TrainingProgramBase):
    pass

class TrainingProgramUpdate(TrainingProgramBase):
    pass

class TrainingProgramRead(TrainingProgramBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
