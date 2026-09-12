from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime, nullable=False)

    trainee = relationship("Trainee", back_populates="user", uselist=False)
    employer = relationship("Employer", back_populates="user", uselist=False)
    government_user = relationship(
        "GovernmentUser",
        back_populates="user",
        uselist=False,
    )
