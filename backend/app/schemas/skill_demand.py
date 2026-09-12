from typing import Any
from pydantic import BaseModel, ConfigDict

class SkillDemandBase(BaseModel):
    skill_id: Any | None = None
    district_id: Any | None = None
    occupation_id: Any | None = None
    demand_score: Any | None = None
    recorded_at: Any | None = None

class SkillDemandCreate(SkillDemandBase):
    pass

class SkillDemandUpdate(SkillDemandBase):
    pass

class SkillDemandRead(SkillDemandBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
