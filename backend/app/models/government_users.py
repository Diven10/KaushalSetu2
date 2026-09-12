from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class GovernmentUser(Base):
    __tablename__ = "government_users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
    )
    department = Column(String(150), nullable=True)

    user = relationship("User", back_populates="government_user")
