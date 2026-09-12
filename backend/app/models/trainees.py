from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Trainee(Base):
    __tablename__ = "trainees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )
    district_id = Column(
        Integer,
        ForeignKey("districts.id"),
        nullable=True,
    )
    full_name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    training_program_id = Column(
        Integer,
        ForeignKey("training_programs.id"),
        nullable=True,
    )

    user = relationship("User", back_populates="trainee")
    district = relationship("District", back_populates="trainees")
    training_program = relationship(
        "TrainingProgram",
        back_populates="trainees",
    )
    applications = relationship("Application", back_populates="trainee")
    assessments = relationship("Assessment", back_populates="trainee")
    employment_records = relationship("Employment", back_populates="trainee")
    trainee_skills = relationship("TraineeSkill", back_populates="trainee")
