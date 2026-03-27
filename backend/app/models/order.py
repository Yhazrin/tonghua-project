from sqlalchemy import (
    Column, Integer, String, DateTime, Text, DECIMAL, Enum, Boolean,
    ForeignKey, func,
)
from app.database import Base


class Order(Base):
    """订单 — PRD 7.1 order 实体

    donation_amount 由系统计算（= total_amount × 0.3），入库后不可修改。
    退款流程需同步更新捐赠核算。
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_no = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # ── SKU 快照（冗余，防改价） ──────────────────────────────
    sku_id = Column(Integer, ForeignKey("product_skus.id"), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(DECIMAL(12, 2), nullable=False)
    total_amount = Column(DECIMAL(12, 2), nullable=False)

    # ── 捐赠 ──────────────────────────────────────────────────
    donation_amount = Column(DECIMAL(12, 2), nullable=False, default=0)  # = total_amount × 0.3

    # ── 支付 ──────────────────────────────────────────────────
    pay_time = Column(DateTime, nullable=True)
    pay_channel = Column(
        Enum("wechat", "alipay", name="pay_channel"),
        nullable=True,
    )
    payment_id = Column(String(200), nullable=True)

    # ── 状态 ──────────────────────────────────────────────────
    order_status = Column(
        Enum(
            "pending_payment",  # 待支付
            "paid",             # 已支付
            "shipped",          # 已发货
            "delivered",        # 已签收
            "refunded",         # 已退款
            "cancelled",        # 已取消
            name="order_status",
        ),
        default="pending_payment",
        nullable=False,
    )

    # ── 兼容旧字段 ────────────────────────────────────────────
    status = Column(String(20), nullable=True)
    payment_method = Column(String(50), nullable=True)

    # ── 旧衣回收 ──────────────────────────────────────────────
    recycle_requested = Column(Boolean, default=False, nullable=False)  # 是否申请旧衣回收

    # ── 收货地址快照 ──────────────────────────────────────────
    shipping_address = Column(Text, nullable=True)  # JSON 收货地址快照

    # ── 时间戳 ────────────────────────────────────────────────
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class OrderItem(Base):
    """订单明细 — 保留向后兼容"""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    sku_id = Column(Integer, ForeignKey("product_skus.id"), nullable=True, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(DECIMAL(12, 2), nullable=False)
    donation_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
