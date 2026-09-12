from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class TraineeSkill(Base):
    __tablename__ = "trainee_skills"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(
        Integer,
        ForeignKey("trainees.id"),
        nullable=False,
    )
    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False,
    )
    proficiency_level = Column(String(20), nullable=True)

    __table_args__ = (
        UniqueConstraint("trainee_id", "skill_id"),
    )

    trainee = relationship("Trainee", back_populates="trainee_skills")
    skill = relationship("Skill", back_populates="trainee_skills")
