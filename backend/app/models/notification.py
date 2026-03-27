from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Enum, Text,
    ForeignKey, func,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    """用户消息通知 — PRD 4.8 个人中心

    通知类型：投票结果公告、订单状态变更、捐赠公示更新等。
    可标记已读/清除，前端未读数角标。
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(
        Enum(
            "vote_result",        # 投票结果公告
            "order_status",       # 订单状态变更
            "donation_update",    # 捐赠公示更新
            "recycle_status",     # 旧衣回收状态
            "system",             # 系统通知
            name="notification_category",
        ),
        nullable=False,
    )
    # 关联资源（可选，方便前端跳转）
    resource_type = Column(String(50), nullable=True)   # order / vote / donation / recycle
    resource_id = Column(Integer, nullable=True)

    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
