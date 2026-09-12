from typing import Any
from pydantic import BaseModel, ConfigDict

class JobSkillBase(BaseModel):
    job_id: Any | None = None
    skill_id: Any | None = None

class JobSkillCreate(JobSkillBase):
    pass

class JobSkillUpdate(JobSkillBase):
    pass

class JobSkillRead(JobSkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
