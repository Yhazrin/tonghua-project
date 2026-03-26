from sqlalchemy import (
    Column, Integer, String, DateTime, Text, Enum, ForeignKey, JSON, func,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Artwork(Base):
    """儿童画作 — PRD 7.1 artwork 实体

    原图路径与脱敏图路径分列存储。
    author_alias 不可为真实姓名。
    """
    __tablename__ = "artworks"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── 画作基本信息 ──────────────────────────────────────────
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    region = Column(String(200), nullable=True)                  # 来源地区
    author_alias = Column(String(100), nullable=False)           # 匿名化名（非真实姓名）
    age_group = Column(
        Enum("6-9", "10-13", "14-17", name="artwork_age_group"),
        nullable=True,
    )
    theme_tags = Column(JSON, nullable=True)                     # 主题标签（多值）：自然/动物/人物/建筑/抽象

    # ── 图片路径 ──────────────────────────────────────────────
    original_image_url = Column(String(500), nullable=False)     # 原图路径（仅管理端可见）
    desensitized_image_url = Column(String(500), nullable=True)  # 脱敏图路径（客户端展示）
    thumbnail_url = Column(String(500), nullable=True)

    # ── 兼容旧字段 ────────────────────────────────────────────
    image_url = Column(String(500), nullable=True)               # 向后兼容
    artist_name = Column(String(100), nullable=True)             # 向后兼容

    # ── 关联 ──────────────────────────────────────────────────
    child_participant_id = Column(Integer, ForeignKey("child_participants.id"), nullable=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True, index=True)
    upload_staff_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)  # 上传收集员

    # ── 审核 ──────────────────────────────────────────────────
    audit_status = Column(
        Enum("pending", "approved", "rejected", name="artwork_audit_status"),
        default="pending",
        nullable=False,
    )
    auditor_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    audit_note = Column(Text, nullable=True)                     # 审核备注 / 驳回原因
    audit_time = Column(DateTime, nullable=True)

    # ── 展示状态 ──────────────────────────────────────────────
    display_status = Column(
        Enum("visible", "hidden", name="artwork_display_status"),
        default="visible",
        nullable=False,
    )

    # ── 兼容旧 status 字段 ────────────────────────────────────
    status = Column(
        Enum("draft", "pending", "approved", "rejected", "featured", name="artwork_status"),
        default="draft",
        nullable=True,
    )

    # ── 互动数据 ──────────────────────────────────────────────
    like_count = Column(Integer, default=0, nullable=False)
    favorite_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)

    # ── 时间戳 ────────────────────────────────────────────────
    upload_time = Column(DateTime, server_default=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    child_participant = relationship(
        "ChildParticipant",
        back_populates="artworks",
        lazy="joined",
        uselist=False,
    )
