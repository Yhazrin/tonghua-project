from sqlalchemy import Column, Integer, String, DateTime, Text, DECIMAL, Enum, ForeignKey, func
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_no = Column(String(50), unique=True, nullable=False, index=True)
    total_amount = Column(DECIMAL(12, 2), nullable=False)
    status = Column(
        Enum(
            "pending",          # 待支付
            "paid",             # 已支付
            "processing",       # 处理中（备货）
            "shipped",          # 已发货
            "delivered",        # 已到达
            "completed",        # 已完成（确认收货）
            "cancelled",        # 已取消
            "refunding",        # 退款中
            "refunded",         # 已退款
            name="order_status"
        ),
        default="pending",
        nullable=False,
    )
    shipping_address = Column(Text, nullable=True)
    receiver_name = Column(String(100), nullable=True)
    receiver_phone = Column(String(20), nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_id = Column(String(200), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(DECIMAL(12, 2), nullable=False)
