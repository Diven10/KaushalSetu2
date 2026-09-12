from typing import Any
from pydantic import BaseModel, ConfigDict

class SkillBase(BaseModel):
    name: Any | None = None
    category: Any | None = None

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    pass

class SkillRead(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
