from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    category = Column(String(100), nullable=True)

    job_skills = relationship("JobSkill", back_populates="skill")
    trainee_skills = relationship("TraineeSkill", back_populates="skill")
    assessments = relationship("Assessment", back_populates="skill")
    training_programs = relationship(
        "TrainingProgram",
        back_populates="primary_skill",
    )
    demand_records = relationship(
        "SkillDemand",
        back_populates="skill",
    )
