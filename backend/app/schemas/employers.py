from typing import Any
from pydantic import BaseModel, ConfigDict

class EmployerBase(BaseModel):
    user_id: Any | None = None
    district_id: Any | None = None
    company_name: Any | None = None
    contact_phone: Any | None = None

class EmployerCreate(EmployerBase):
    pass

class EmployerUpdate(EmployerBase):
    pass

class EmployerRead(EmployerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
