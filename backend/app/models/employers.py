from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Employer(Base):
    __tablename__ = "employers"

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
    company_name = Column(String(150), nullable=False)
    contact_phone = Column(String(20), nullable=True)

    user = relationship("User", back_populates="employer")
    district = relationship("District", back_populates="employers")
    jobs = relationship("Job", back_populates="employer")
    employment_records = relationship(
        "Employment",
        back_populates="employer",
    )
