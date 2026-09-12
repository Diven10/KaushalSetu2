from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False,
    )
    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("job_id", "skill_id"),
    )

    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")
