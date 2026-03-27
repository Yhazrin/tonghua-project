from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Enum, Text,
    ForeignKey, UniqueConstraint, func,
)
from app.database import Base


class Vote(Base):
    """投票记录 — PRD 7.1 + PRD 4.5 投票模块

    约束：同一 voter_phone_hash + vote_type 唯一
    is_valid 字段不可由用户修改，仅由系统/管理员标记。
    """
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    voter_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # 登录用户关联
    voter_phone_hash = Column(String(64), nullable=False, index=True)   # SHA-256 手机号哈希（脱敏存储）
    voter_ip_hash = Column(String(64), nullable=True)                   # SHA-256 IP哈希（脱敏存储）
    design_id = Column(Integer, ForeignKey("designs.id"), nullable=False, index=True)
    vote_time = Column(DateTime, server_default=func.now(), nullable=False)
    vote_type = Column(
        Enum("internal", "public", name="vote_type"),
        nullable=False,
    )  # internal=品牌内部投票, public=大众投票
    is_valid = Column(Boolean, default=True, nullable=False)
    invalid_reason = Column(String(200), nullable=True)   # 无效原因（刷票/重复等）
    device_fingerprint = Column(String(128), nullable=True)  # 设备指纹（防刷票）

    __table_args__ = (
        UniqueConstraint("voter_phone_hash", "vote_type", "design_id", name="uq_vote_phone_type_design"),
    )


class Design(Base):
    """设计稿 — PRD 7.1 设计稿实体

    设计师上传融入儿童画作的慈善系列设计稿。
    版本号自动递增，design_concept 不得为空。
    """
    __tablename__ = "designs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    designer_id = Column(Integer, ForeignKey("admin_users.id"), nullable=False, index=True)
    artwork_ids = Column(Text, nullable=False)            # 关联画作 ID 数组（JSON 字符串）
    design_concept = Column(Text, nullable=False)         # 设计理念（≥200字）
    image_url = Column(String(500), nullable=False)       # 设计稿高清图
    thumbnail_url = Column(String(500), nullable=True)
    version = Column(Integer, default=1, nullable=False)  # 版本号，自动递增
    internal_vote_count = Column(Integer, default=0, nullable=False)
    public_vote_count = Column(Integer, default=0, nullable=False)
    is_shortlisted = Column(Boolean, default=False, nullable=False)  # 是否入围5套
    is_final = Column(Boolean, default=False, nullable=False)        # 是否入选3套终稿
    status = Column(
        Enum("draft", "submitted", "shortlisted", "final", "rejected", name="design_status"),
        default="draft",
        nullable=False,
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
