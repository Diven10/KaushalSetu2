from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(
        Integer,
        ForeignKey("trainees.id"),
        nullable=False,
    )
    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=True,
    )
    training_program_id = Column(
        Integer,
        ForeignKey("training_programs.id"),
        nullable=True,
    )
    score = Column(Numeric(5, 2), nullable=False)
    assessed_at = Column(DateTime, nullable=False)

    trainee = relationship("Trainee", back_populates="assessments")
    skill = relationship("Skill", back_populates="assessments")
    training_program = relationship(
        "TrainingProgram",
        back_populates="assessments",
    )
