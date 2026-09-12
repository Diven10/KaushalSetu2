from typing import Any
from pydantic import BaseModel, ConfigDict

class EmploymentFollowupBase(BaseModel):
    employment_id: Any | None = None
    followup_date: Any | None = None
    retained: Any | None = None
    salary_at_followup: Any | None = None

class EmploymentFollowupCreate(EmploymentFollowupBase):
    pass

class EmploymentFollowupUpdate(EmploymentFollowupBase):
    pass

class EmploymentFollowupRead(EmploymentFollowupBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
