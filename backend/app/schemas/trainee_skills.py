from typing import Any
from pydantic import BaseModel, ConfigDict

class TraineeSkillBase(BaseModel):
    trainee_id: Any | None = None
    skill_id: Any | None = None
    proficiency_level: Any | None = None

class TraineeSkillCreate(TraineeSkillBase):
    pass

class TraineeSkillUpdate(TraineeSkillBase):
    pass

class TraineeSkillRead(TraineeSkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
