from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Enum, Text, JSON,
    ForeignKey, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.security import aes_encrypt, aes_decrypt


class User(Base):
    """客户端用户表 — PRD 4.8 个人中心

    主登录方式：手机号 + 验证码
    辅助登录：微信快捷登录（wechat_openid）
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── 登录凭证 ──────────────────────────────────────────────
    phone_encrypted = Column(Text, nullable=True)       # AES-256-GCM 加密手机号（主登录方式）
    phone_hash = Column(String(64), unique=True, nullable=True, index=True)  # SHA-256 手机号哈希，用于唯一索引 & 查找
    email = Column(String(255), unique=True, nullable=True, index=True)      # 可选邮箱
    password_hash = Column(String(255), nullable=True)  # 可为空（微信登录无密码）

    # ── 第三方登录 ────────────────────────────────────────────
    wechat_openid = Column(String(128), unique=True, nullable=True, index=True)  # 微信 OpenID
    wechat_unionid = Column(String(128), unique=True, nullable=True, index=True) # 微信 UnionID（跨应用）

    # ── 基本信息 ──────────────────────────────────────────────
    nickname = Column(String(100), nullable=False, default="用户")
    avatar = Column(String(500), nullable=True)
    gender = Column(Enum("unknown", "male", "female", name="user_gender"), default="unknown", nullable=False)

    # ── 角色 & 状态 ──────────────────────────────────────────
    role = Column(
        Enum("user", "collector", name="client_role"),
        default="user",
        nullable=False,
    )  # user=普通消费者/投票用户, collector=画作收集员
    status = Column(
        Enum("active", "banned", "inactive", name="user_status"),
        default="active",
        nullable=False,
    )

    # ── 碳贡献统计（缓存字段，定时同步） ──────────────────────
    total_carbon_saved_kg = Column(Integer, default=0, nullable=False)   # 累计碳减排 kg
    total_donation_amount = Column(Integer, default=0, nullable=False)   # 累计捐赠金额（分）
    total_recycle_count = Column(Integer, default=0, nullable=False)     # 累计旧衣回收件数

    # ── 时间戳 ────────────────────────────────────────────────
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    addresses = relationship("UserAddress", back_populates="user", lazy="dynamic")
    notifications = relationship("Notification", back_populates="user", lazy="dynamic")

    @property
    def phone_decrypted(self) -> str | None:
        return aes_decrypt(self.phone_encrypted) if self.phone_encrypted else None


class AdminUser(Base):
    """管理端用户表 — PRD 5.1/5.2 权限与账号管理

    独立于客户端用户，RBAC 6 角色体系。
    支持 CSV 批量导入、SSO（可选）、异地登录验证、闲置超时。
    """
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── 登录凭证 ──────────────────────────────────────────────
    username = Column(String(100), unique=True, nullable=False, index=True)  # 员工工号 / 用户名
    password_hash = Column(String(255), nullable=False)
    real_name = Column(String(100), nullable=False)     # 真实姓名（操作日志用）

    # ── RBAC 角色 — PRD 5.1 权限矩阵 ────────────────────────
    role = Column(
        Enum(
            "admin",       # 管理员 — 全权
            "auditor",     # 审核岗 — 画作审核 + 脱敏处理
            "designer",    # 设计岗 — 设计稿上传 + 投票管理
            "logistics",   # 物流岗 — 物流管理 + 旧衣回收
            "finance",     # 财务岗 — 捐赠核算 + 定价审批
            "operator",    # 运营岗 — 商品上架 + 供应链 + 公示内容
            name="admin_role",
        ),
        nullable=False,
    )

    status = Column(
        Enum("active", "disabled", name="admin_status"),
        default="active",
        nullable=False,
    )

    # ── 安全相关 ──────────────────────────────────────────────
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String(45), nullable=True)
    failed_login_count = Column(Integer, default=0, nullable=False)
    totp_secret = Column(String(64), nullable=True)     # 2FA TOTP 密钥

    # ── 时间戳 ────────────────────────────────────────────────
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class ChildParticipant(Base):
    """山区儿童参与者 — PRD N-02 儿童画作征集

    所有儿童真实信息 AES-256 加密存储，前端只展示 display_name。
    """
    __tablename__ = "child_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    child_name = Column(Text, nullable=False)           # AES-256-GCM 加密
    display_name = Column(String(100), nullable=False)  # 匿名化名（前端展示）
    age = Column(Integer, nullable=False)
    age_group = Column(
        Enum("6-9", "10-13", "14-17", name="child_age_group"),
        nullable=True,
    )  # PRD 画作分类维度
    guardian_name = Column(Text, nullable=False)         # AES-256-GCM 加密
    guardian_phone_encrypted = Column(Text, nullable=True)
    guardian_email_encrypted = Column(Text, nullable=True)
    region = Column(String(200), nullable=True)
    school = Column(String(200), nullable=True)
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime, nullable=True)
    artwork_count = Column(Integer, default=0, nullable=False)
    status = Column(
        Enum("active", "withdrawn", "pending_review", name="child_status"),
        default="pending_review",
        nullable=False,
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    artworks = relationship("Artwork", back_populates="child_participant", lazy="dynamic")

    @property
    def child_name_decrypted(self) -> str | None:
        return aes_decrypt(self.child_name) if self.child_name else None

    @property
    def guardian_name_decrypted(self) -> str | None:
        return aes_decrypt(self.guardian_name) if self.guardian_name else None

    @property
    def guardian_phone_decrypted(self) -> str | None:
        return aes_decrypt(self.guardian_phone_encrypted) if self.guardian_phone_encrypted else None

    @property
    def guardian_email_decrypted(self) -> str | None:
        return aes_decrypt(self.guardian_email_encrypted) if self.guardian_email_encrypted else None

    @classmethod
    def create_with_encryption(cls, **kwargs):
        if "child_name" in kwargs and kwargs["child_name"]:
            kwargs["child_name"] = aes_encrypt(kwargs["child_name"])
        if "guardian_name" in kwargs and kwargs["guardian_name"]:
            kwargs["guardian_name"] = aes_encrypt(kwargs["guardian_name"])
        if "guardian_phone_encrypted" in kwargs and kwargs["guardian_phone_encrypted"]:
            kwargs["guardian_phone_encrypted"] = aes_encrypt(kwargs["guardian_phone_encrypted"])
        if "guardian_email_encrypted" in kwargs and kwargs["guardian_email_encrypted"]:
            kwargs["guardian_email_encrypted"] = aes_encrypt(kwargs["guardian_email_encrypted"])
        return cls(**kwargs)


class UserAddress(Base):
    """用户收货地址 — PRD 4.8 个人中心

    每个用户最多 10 条地址，支持设置默认地址。
    地址信息 AES 加密存储。
    """
    __tablename__ = "user_addresses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_name = Column(String(100), nullable=False)
    receiver_phone_encrypted = Column(Text, nullable=False)  # AES-256-GCM 加密
    province = Column(String(50), nullable=False)
    city = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    detail_address_encrypted = Column(Text, nullable=False)  # AES-256-GCM 加密详细地址
    postal_code = Column(String(10), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="addresses")

    @property
    def receiver_phone_decrypted(self) -> str | None:
        return aes_decrypt(self.receiver_phone_encrypted) if self.receiver_phone_encrypted else None

    @property
    def detail_address_decrypted(self) -> str | None:
        return aes_decrypt(self.detail_address_encrypted) if self.detail_address_encrypted else None
