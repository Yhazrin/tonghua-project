from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, func
from app.database import Base


class LogisticsRecord(Base):
    """物流追踪记录，关联订单，记录每个物流节点"""
    __tablename__ = "logistics_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    tracking_no = Column(String(100), nullable=True, index=True)
    carrier = Column(String(100), nullable=True)
    status = Column(
        Enum(
            "pending",       # 待揽收
            "picked_up",     # 已揽收
            "in_transit",    # 运输中
            "out_for_delivery",  # 派送中
            "delivered",     # 已签收
            "exception",     # 异常
            name="logistics_status"
        ),
        default="pending",
        nullable=False,
    )
    current_location = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class LogisticsEvent(Base):
    """物流轨迹事件，记录每次状态变更"""
    __tablename__ = "logistics_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    logistics_id = Column(Integer, ForeignKey("logistics_records.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    location = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    event_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
