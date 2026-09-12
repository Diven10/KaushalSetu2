from typing import Any
from pydantic import BaseModel, ConfigDict

class AssessmentBase(BaseModel):
    trainee_id: Any | None = None
    skill_id: Any | None = None
    training_program_id: Any | None = None
    score: Any | None = None
    assessed_at: Any | None = None

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(AssessmentBase):
    pass

class AssessmentRead(AssessmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
