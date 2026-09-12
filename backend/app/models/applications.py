from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    trainee_id = Column(
        Integer,
        ForeignKey("trainees.id"),
        nullable=False,
    )
    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False,
    )
    status = Column(
        String(20),
        nullable=False,
        default="applied",
    )
    applied_at = Column(DateTime, nullable=False)

    __table_args__ = (
        UniqueConstraint("trainee_id", "job_id"),
    )

    trainee = relationship("Trainee", back_populates="applications")
    job = relationship("Job", back_populates="applications")
