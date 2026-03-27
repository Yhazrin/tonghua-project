from sqlalchemy import (
    Column, Integer, String, DateTime, Text, DECIMAL, Enum, Boolean, JSON,
    ForeignKey, func,
)
from app.database import Base


class Donation(Base):
    """捐赠记录 — PRD 7.1 donation 实体

    系统按销售数据自动核算当期 30% 捐赠金额。
    双人确认字段：confirmer_id + second_confirmer_id。
    proof_url 需审核通过后才更新 publish_status。
    """
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── 核算周期 ──────────────────────────────────────────────
    period = Column(String(20), nullable=True)            # 核算周期，如 "2026Q1"

    # ── 金额 ──────────────────────────────────────────────────
    total_sales = Column(DECIMAL(12, 2), default=0, nullable=False)       # 当期销售额
    donation_amount = Column(DECIMAL(12, 2), nullable=False)              # = total_sales × 0.3
    amount = Column(DECIMAL(12, 2), nullable=False)                       # 兼容旧字段
    currency = Column(Enum("CNY", "USD", name="donation_currency"), default="CNY", nullable=False)

    # ── 双人确认 — PRD 5.8 ────────────────────────────────────
    confirmer_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    second_confirmer_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    confirm_time = Column(DateTime, nullable=True)

    # ── 物资采购 ──────────────────────────────────────────────
    material_list = Column(JSON, nullable=True)           # 品类/数量/金额 JSON
    target_region = Column(String(200), nullable=True)    # 捐赠目标地区

    # ── 凭证 & 公示 ──────────────────────────────────────────
    proof_url = Column(String(500), nullable=True)        # 凭证 URL
    actual_delivery_time = Column(DateTime, nullable=True)
    publish_status = Column(
        Enum("draft", "pending_review", "published", name="donation_publish_status"),
        default="draft",
        nullable=False,
    )

    # ── 兼容旧字段 ────────────────────────────────────────────
    donor_name = Column(String(100), nullable=True)
    donor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    payment_method = Column(String(50), nullable=True)
    payment_id = Column(String(200), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True, index=True)
    status = Column(
        Enum("pending", "completed", "failed", "refunded", name="donation_status"),
        default="pending",
        nullable=False,
    )
    is_anonymous = Column(Boolean, default=False, nullable=False)
    message = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
