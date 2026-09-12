from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class EmploymentFollowup(Base):
    __tablename__ = "employment_followups"

    id = Column(Integer, primary_key=True, index=True)
    employment_id = Column(
        Integer,
        ForeignKey("employment.id"),
        nullable=False,
    )
    followup_date = Column(Date, nullable=False)
    retained = Column(Boolean, nullable=False)
    salary_at_followup = Column(Numeric(10, 2), nullable=True)

    employment = relationship(
        "Employment",
        back_populates="followups",
    )
