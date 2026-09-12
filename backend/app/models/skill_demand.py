from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class SkillDemand(Base):
    __tablename__ = "skill_demand"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False,
    )
    district_id = Column(
        Integer,
        ForeignKey("districts.id"),
        nullable=True,
    )
    occupation_id = Column(
        Integer,
        ForeignKey("occupations.id"),
        nullable=True,
    )
    demand_score = Column(Numeric(5, 2), nullable=False)
    recorded_at = Column(Date, nullable=False)

    skill = relationship("Skill", back_populates="demand_records")
    district = relationship("District", back_populates="skill_demand_records")
    occupation = relationship(
        "Occupation",
        back_populates="demand_records",
    )
