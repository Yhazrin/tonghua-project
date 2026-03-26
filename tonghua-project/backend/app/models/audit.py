from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, func
from app.database import Base


class AuditLog(Base):
    """操作日志 — PRD 5.2 权限与账号管理

    全程记录所有管理端操作。不可删除、不可篡改。
    日志保留 ≥2 年。支持按时间/人员/模块过滤。
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    operator_id = Column(Integer, nullable=False, index=True)    # 操作人 ID（admin_users.id）
    operator_name = Column(String(100), nullable=False)          # 操作人姓名
    action = Column(String(100), nullable=False, index=True)     # 操作动作
    module = Column(String(100), nullable=False, index=True)     # 操作模块
    resource = Column(String(100), nullable=True)                # 资源类型
    resource_id = Column(String(100), nullable=True)             # 资源 ID
    before_value = Column(JSON, nullable=True)                   # 变更前值
    after_value = Column(JSON, nullable=True)                    # 变更后值
    details = Column(Text, nullable=True)                        # 补充说明
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    # 兼容旧字段
    user_id = Column(Integer, nullable=True, index=True)
    user_name = Column(String(100), nullable=True)
