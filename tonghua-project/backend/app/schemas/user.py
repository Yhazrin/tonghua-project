from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ═══════════════════════════════════════════════════════════════
#  客户端用户 — User
# ═══════════════════════════════════════════════════════════════

class UserCreate(BaseModel):
    """手机号 + 验证码注册"""
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$", description="手机号（中国大陆）")
    sms_code: str = Field(..., min_length=6, max_length=6, description="短信验证码")
    nickname: Optional[str] = Field(None, min_length=1, max_length=100, description="昵称")


class UserCreateByEmail(BaseModel):
    """邮箱注册（兼容旧接口）"""
    email: EmailStr = Field(..., description="邮箱")
    password: str = Field(..., min_length=8, max_length=128, description="密码")
    nickname: str = Field(..., min_length=1, max_length=100, description="昵称")
    phone: Optional[str] = Field(None, description="手机号")


class UserLoginBySms(BaseModel):
    """手机号验证码登录"""
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    sms_code: str = Field(..., min_length=6, max_length=6)


class UserLoginByWechat(BaseModel):
    """微信快捷登录"""
    code: str = Field(..., description="微信授权 code")


class UserUpdate(BaseModel):
    nickname: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar: Optional[str] = Field(None, max_length=500)
    gender: Optional[str] = Field(None, pattern="^(unknown|male|female)$")


class UserOut(BaseModel):
    id: int
    nickname: str
    avatar: Optional[str] = None
    gender: str = "unknown"
    role: str
    status: str
    total_carbon_saved_kg: int = 0
    total_donation_amount: int = 0
    total_recycle_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserOutWithPhone(UserOut):
    """含脱敏手机号（仅本人可见）"""
    phone_masked: Optional[str] = None  # 138****1234


class UserOutSensitive(UserOut):
    """含完整手机号（管理员可见）"""
    email: Optional[str] = None
    phone: Optional[str] = Field(None, description="解密后手机号")


class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(user|collector)$")


class UserStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(active|banned|inactive)$")


# ═══════════════════════════════════════════════════════════════
#  管理端用户 — AdminUser
# ═══════════════════════════════════════════════════════════════

class AdminUserCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=100, description="员工工号/用户名")
    password: str = Field(..., min_length=8, max_length=128)
    real_name: str = Field(..., min_length=1, max_length=100, description="真实姓名")
    role: str = Field(
        ...,
        pattern="^(admin|auditor|designer|logistics|finance|operator)$",
        description="RBAC 角色",
    )


class AdminUserUpdate(BaseModel):
    real_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[str] = Field(None, pattern="^(admin|auditor|designer|logistics|finance|operator)$")
    status: Optional[str] = Field(None, pattern="^(active|disabled)$")


class AdminUserOut(BaseModel):
    id: int
    username: str
    real_name: str
    role: str
    status: str
    last_login_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminUserBatchImport(BaseModel):
    """CSV 批量导入管理端账号"""
    users: List[AdminUserCreate] = Field(..., min_length=1, max_length=100)


# ═══════════════════════════════════════════════════════════════
#  收货地址 — UserAddress
# ═══════════════════════════════════════════════════════════════

class AddressCreate(BaseModel):
    receiver_name: str = Field(..., min_length=1, max_length=100)
    receiver_phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    province: str = Field(..., max_length=50)
    city: str = Field(..., max_length=50)
    district: str = Field(..., max_length=50)
    detail_address: str = Field(..., min_length=1, max_length=500)
    postal_code: Optional[str] = Field(None, max_length=10)
    is_default: bool = False


class AddressUpdate(BaseModel):
    receiver_name: Optional[str] = Field(None, min_length=1, max_length=100)
    receiver_phone: Optional[str] = Field(None, pattern=r"^1[3-9]\d{9}$")
    province: Optional[str] = Field(None, max_length=50)
    city: Optional[str] = Field(None, max_length=50)
    district: Optional[str] = Field(None, max_length=50)
    detail_address: Optional[str] = Field(None, min_length=1, max_length=500)
    postal_code: Optional[str] = Field(None, max_length=10)
    is_default: Optional[bool] = None


class AddressOut(BaseModel):
    id: int
    receiver_name: str
    receiver_phone_masked: str  # 138****1234
    province: str
    city: str
    district: str
    detail_address: str  # 解密后
    postal_code: Optional[str] = None
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════
#  儿童参与者 — ChildParticipant
# ═══════════════════════════════════════════════════════════════

class ChildParticipantCreate(BaseModel):
    child_name: str = Field(..., min_length=1, max_length=100, description="真实姓名（加密存储）")
    display_name: str = Field(..., min_length=1, max_length=100, description="公开匿名化名")
    age: int = Field(..., ge=1, le=17)
    age_group: Optional[str] = Field(None, pattern="^(6-9|10-13|14-17)$")
    guardian_name: str = Field(..., min_length=1, max_length=100)
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None
    region: Optional[str] = Field(None, max_length=200)
    school: Optional[str] = Field(None, max_length=200)


class ChildParticipantUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    region: Optional[str] = Field(None, max_length=200)
    school: Optional[str] = Field(None, max_length=200)
    status: Optional[str] = Field(None, pattern="^(active|withdrawn|pending_review)$")


class ChildParticipantOut(BaseModel):
    id: int
    display_name: str
    age: int
    age_group: Optional[str] = None
    region: Optional[str] = None
    school: Optional[str] = None
    consent_given: bool
    consent_date: Optional[datetime] = None
    artwork_count: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChildParticipantOutSensitive(ChildParticipantOut):
    """管理端可见完整信息"""
    child_name: str
    guardian_name: str
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None


class ChildParticipantFrontend(BaseModel):
    """前端兼容格式"""
    id: str
    firstName: str
    age: int
    guardianId: Optional[str] = None
    schoolName: Optional[str] = None
    consentGiven: bool
    consentDate: Optional[str] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}
