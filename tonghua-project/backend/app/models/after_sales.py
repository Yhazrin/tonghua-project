from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, DECIMAL, func
from app.database import Base


class AfterSalesRequest(Base):
    """售后申请，支持退货/换货/维修/投诉"""
    __tablename__ = "after_sales_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    request_type = Column(
        Enum("return", "exchange", "repair", "complaint", "inquiry", name="after_sales_type"),
        nullable=False,
    )
    reason = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    status = Column(
        Enum(
            "submitted",      # 已提交
            "reviewing",      # 审核中
            "approved",       # 已批准
            "rejected",       # 已拒绝
            "processing",     # 处理中
            "completed",      # 已完成
            name="after_sales_status"
        ),
        default="submitted",
        nullable=False,
    )
    refund_amount = Column(DECIMAL(12, 2), nullable=True)
    refund_status = Column(
        Enum("pending", "processing", "completed", "failed", name="refund_status"),
        nullable=True,
    )
    admin_note = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class AfterSalesMessage(Base):
    """售后沟通消息"""
    __tablename__ = "after_sales_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("after_sales_requests.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(Enum("user", "admin", name="message_sender_role"), nullable=False)
    content = Column(Text, nullable=False)
    images = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
