from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    trainees = relationship("Trainee", back_populates="district")
    training_providers = relationship("TrainingProvider", back_populates="district")
    employers = relationship("Employer", back_populates="district")
    jobs = relationship("Job", back_populates="district")
    employment_records = relationship("Employment", back_populates="district")
    skill_demand_records = relationship("SkillDemand", back_populates="district")
