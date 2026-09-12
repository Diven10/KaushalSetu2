from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class TrainingProvider(Base):
    __tablename__ = "training_providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    district_id = Column(
        Integer,
        ForeignKey("districts.id"),
        nullable=True,
    )

    district = relationship("District", back_populates="training_providers")
    training_programs = relationship(
        "TrainingProgram",
        back_populates="training_provider",
    )
