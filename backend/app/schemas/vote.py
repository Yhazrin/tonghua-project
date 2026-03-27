from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════
#  投票 — Vote
# ═══════════════════════════════════════════════════════════════

class VoteCreate(BaseModel):
    """大众投票（需手机验证码认证）"""
    design_id: int = Field(..., description="投票的设计稿 ID")
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$", description="手机号（用于防重复）")
    sms_code: str = Field(..., min_length=6, max_length=6, description="短信验证码")


class InternalVoteCreate(BaseModel):
    """品牌内部投票"""
    design_id: int = Field(...)


class VoteOut(BaseModel):
    id: int
    design_id: int
    vote_type: str
    vote_time: datetime
    is_valid: bool

    model_config = {"from_attributes": True}


class VoteRecordOut(BaseModel):
    """个人中心 — 投票记录"""
    id: int
    design_id: int
    vote_type: str
    vote_time: datetime
    is_valid: bool
    is_selected: Optional[bool] = None  # 该设计是否最终入选

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════
#  设计稿 — Design
# ═══════════════════════════════════════════════════════════════

class DesignCreate(BaseModel):
    artwork_ids: list[int] = Field(..., min_length=1, description="关联画作 ID 列表")
    design_concept: str = Field(..., min_length=200, description="设计理念（≥200字）")
    image_url: str = Field(..., max_length=500, description="设计稿高清图 URL")
    thumbnail_url: Optional[str] = Field(None, max_length=500)


class DesignUpdate(BaseModel):
    design_concept: Optional[str] = Field(None, min_length=200)
    image_url: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, pattern="^(draft|submitted|shortlisted|final|rejected)$")


class DesignOut(BaseModel):
    id: int
    designer_id: int
    artwork_ids: str  # JSON string
    design_concept: str
    image_url: str
    thumbnail_url: Optional[str] = None
    version: int
    internal_vote_count: int
    public_vote_count: int
    is_shortlisted: bool
    is_final: bool
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DesignListItem(BaseModel):
    id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    internal_vote_count: int
    public_vote_count: int
    is_shortlisted: bool
    is_final: bool
    status: str

    model_config = {"from_attributes": True}
