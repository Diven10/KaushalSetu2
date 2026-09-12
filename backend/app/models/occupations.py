from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Occupation(Base):
    __tablename__ = "occupations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    category = Column(String(100), nullable=True)

    jobs = relationship("Job", back_populates="occupation")
    employment_records = relationship(
        "Employment",
        back_populates="occupation",
    )
    demand_records = relationship(
        "SkillDemand",
        back_populates="occupation",
    )
