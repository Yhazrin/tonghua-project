from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    product_id: int
    order_id: int
    rating: int = Field(..., ge=1, le=5, description="评分 1-5星")
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    images: Optional[List[str]] = Field(None, description="图片URL列表")
    sustainability_rating: Optional[int] = Field(None, ge=1, le=5, description="可持续性评分")
    sustainability_comment: Optional[str] = None
    is_anonymous: bool = False


class ReviewUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern="^(pending|approved|rejected)$")
    admin_note: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    product_id: int
    order_id: int
    user_id: int
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    images: Optional[List[str]] = None
    sustainability_rating: Optional[int] = None
    sustainability_comment: Optional[str] = None
    is_verified_purchase: bool
    is_anonymous: bool
    helpful_count: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewSummary(BaseModel):
    product_id: int
    total_reviews: int
    average_rating: float
    sustainability_avg: Optional[float] = None
    rating_distribution: dict  # {1: count, 2: count, ...5: count}
