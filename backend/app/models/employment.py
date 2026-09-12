from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class Employment(Base):
    __tablename__ = "employment"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(
        Integer,
        ForeignKey("trainees.id"),
        nullable=False,
    )
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
    salary = Column(Numeric(10, 2), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    trainee = relationship("Trainee", back_populates="employment_records")
    employer = relationship("Employer", back_populates="employment_records")
    occupation = relationship("Occupation", back_populates="employment_records")
    district = relationship("District", back_populates="employment_records")
    followups = relationship(
        "EmploymentFollowup",
        back_populates="employment",
    )
