from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Text, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=False)
    avatar = Column(String(500), nullable=True)
    role = Column(Enum("admin", "editor", "user", name="user_role"), default="user", nullable=False)
    phone_encrypted = Column(Text, nullable=True)  # AES-256-GCM encrypted
    status = Column(Enum("active", "banned", name="user_status"), default="active", nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class ChildParticipant(Base):
    __tablename__ = "child_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    child_name = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    guardian_name = Column(String(100), nullable=False)
    guardian_phone_encrypted = Column(Text, nullable=True)
    guardian_email_encrypted = Column(Text, nullable=True)
    region = Column(String(200), nullable=True)
    school = Column(String(200), nullable=True)
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime, nullable=True)
    artwork_count = Column(Integer, default=0, nullable=False)
    status = Column(
        Enum("active", "withdrawn", "pending_review", name="child_status"),
        default="pending_review",
        nullable=False,
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
