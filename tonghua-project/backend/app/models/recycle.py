from sqlalchemy import (
    Column, Integer, String, DateTime, DECIMAL, Enum, Text,
    ForeignKey, func,
)
from app.database import Base


class RecycleOrder(Base):
    """旧衣回收订单 — PRD 7.1 + PRD 2.2 旧衣回收子流程

    用户购买后可预约旧衣回收，品牌安排新能源车辆上门回收。
    回收结果分类：完好→捐赠、轻微破损→修缮、严重破损→再生纤维。
    fiber_kg 数据汇入供应链再生原料库存。
    """
    __tablename__ = "recycle_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recycle_no = Column(String(50), unique=True, nullable=False, index=True)  # 回收单号
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    related_order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, index=True)  # 关联购买订单

    # ── 回收地址 & 时间 ──────────────────────────────────────
    pickup_address_encrypted = Column(Text, nullable=False)  # AES 加密
    pickup_contact_encrypted = Column(Text, nullable=False)  # AES 加密联系人+电话
    pickup_time = Column(DateTime, nullable=False)           # 预约回收时间
    actual_pickup_time = Column(DateTime, nullable=True)     # 实际回收时间

    # ── 状态流转 ──────────────────────────────────────────────
    status = Column(
        Enum(
            "pending",       # 待回收
            "picked_up",     # 已回收
            "sorting",       # 分类中
            "completed",     # 已处理
            "cancelled",     # 已取消
            name="recycle_status",
        ),
        default="pending",
        nullable=False,
    )
    assigned_staff_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)  # 分配的物流岗

    # ── 分类结果 ──────────────────────────────────────────────
    good_qty = Column(Integer, default=0, nullable=False)      # 完好件数（→捐赠）
    damaged_qty = Column(Integer, default=0, nullable=False)   # 破损件数
    fiber_kg = Column(DECIMAL(8, 2), default=0, nullable=False)  # 再生纤维量 kg
    carbon_saved_kg = Column(DECIMAL(8, 2), default=0, nullable=False)  # 本单碳减排 kg

    # ── 备注 ──────────────────────────────────────────────────
    note = Column(Text, nullable=True)

    # ── 时间戳 ────────────────────────────────────────────────
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
