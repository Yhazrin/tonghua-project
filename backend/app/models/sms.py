from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, func,
)
from app.database import Base


class SmsVerificationCode(Base):
    """短信验证码 — PRD 4.8 手机号+验证码注册/登录

    验证码发送成功率 ≥98%，失败重试 3 次。
    同一手机号限制发送频率（60s 间隔）。
    """
    __tablename__ = "sms_verification_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    phone_hash = Column(String(64), nullable=False, index=True)  # SHA-256 手机号哈希
    code = Column(String(6), nullable=False)                     # 6位数字验证码
    purpose = Column(String(20), nullable=False, default="login")  # login / register / reset
    ip_address = Column(String(45), nullable=True)
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)        # 验证尝试次数（防暴力破解）
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
