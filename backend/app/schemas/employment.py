from typing import Any
from pydantic import BaseModel, ConfigDict

class EmploymentBase(BaseModel):
    trainee_id: Any | None = None
    employer_id: Any | None = None
    occupation_id: Any | None = None
    district_id: Any | None = None
    salary: Any | None = None
    start_date: Any | None = None
    end_date: Any | None = None

class EmploymentCreate(EmploymentBase):
    pass

class EmploymentUpdate(EmploymentBase):
    pass

class EmploymentRead(EmploymentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
