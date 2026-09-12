from typing import Any
from pydantic import BaseModel, ConfigDict

class ApplicationBase(BaseModel):
    trainee_id: Any | None = None
    job_id: Any | None = None
    status: Any | None = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(ApplicationBase):
    pass

class ApplicationRead(ApplicationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
