from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(Integer, primary_key=True, index=True)
    training_provider_id = Column(
        Integer,
        ForeignKey("training_providers.id"),
        nullable=False,
    )
    name = Column(String(150), nullable=False)
    duration_weeks = Column(Integer, nullable=True)
    primary_skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=True,
    )

    training_provider = relationship(
        "TrainingProvider",
        back_populates="training_programs",
    )
    primary_skill = relationship(
        "Skill",
        back_populates="training_programs",
    )
    trainees = relationship(
        "Trainee",
        back_populates="training_program",
    )
    assessments = relationship(
        "Assessment",
        back_populates="training_program",
    )
