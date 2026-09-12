from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(
        Integer,
        ForeignKey("employers.id"),
        nullable=False,
    )
    occupation_id = Column(
        Integer,
        ForeignKey("occupations.id"),
        nullable=True,
    )
    district_id = Column(
        Integer,
        ForeignKey("districts.id"),
        nullable=True,
    )
    title = Column(String(150), nullable=False)
    status = Column(String(20), nullable=False, default="open")
    created_at = Column(DateTime, nullable=False)

    employer = relationship("Employer", back_populates="jobs")
    occupation = relationship("Occupation", back_populates="jobs")
    district = relationship("District", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job")
    applications = relationship("Application", back_populates="job")
