from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AIChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class AIChatRequest(BaseModel):
    session_id: str = Field(..., max_length=100)
    message: str = Field(..., min_length=1, max_length=2000)
    interaction_type: str = Field(
        "chat",
        pattern="^(chat|product_recommendation|sustainability_advice|donation_guidance|after_sales_help|style_matching)$"
    )
    context: Optional[Dict[str, Any]] = None    # 上下文数据（产品ID、订单ID等）
    history: Optional[List[AIChatMessage]] = Field(None, max_length=20)


class AIChatResponse(BaseModel):
    session_id: str
    message: str
    interaction_type: str
    suggestions: Optional[List[Dict[str, Any]]] = None   # 推荐产品/活动等
    actions: Optional[List[Dict[str, str]]] = None       # 可执行操作


class AIFeedbackRequest(BaseModel):
    interaction_id: int
    feedback: str = Field(..., pattern="^(helpful|not_helpful)$")


class ClothingDonationCreate(BaseModel):
    clothing_type: str = Field(..., max_length=100)
    quantity: int = Field(1, ge=1, le=100)
    condition: str = Field(..., pattern="^(new|like_new|good|fair)$")
    description: Optional[str] = None
    images: Optional[List[str]] = None
    pickup_address: Optional[str] = None
    pickup_time_slot: Optional[str] = Field(None, max_length=100)
    campaign_id: Optional[int] = None


class ClothingDonationUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        pattern="^(submitted|scheduled|picked_up|processing|converted|completed|rejected)$"
    )
    converted_product_id: Optional[int] = None
    admin_note: Optional[str] = None
    pickup_time_slot: Optional[str] = Field(None, max_length=100)


class ClothingDonationOut(BaseModel):
    id: int
    user_id: int
    campaign_id: Optional[int] = None
    clothing_type: str
    quantity: int
    condition: str
    description: Optional[str] = None
    images: Optional[List[str]] = None
    pickup_address: Optional[str] = None
    pickup_time_slot: Optional[str] = None
    status: str
    converted_product_id: Optional[int] = None
    admin_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SustainabilityMetricOut(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    carbon_saved_kg: Optional[float] = None
    water_saved_liters: Optional[float] = None
    textile_recycled_kg: Optional[float] = None
    trees_equivalent: Optional[float] = None
    sustainability_score: Optional[float] = None
    certification: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SustainabilityMetricCreate(BaseModel):
    entity_type: str = Field(..., pattern="^(product|donation|order)$")
    entity_id: int
    carbon_saved_kg: Optional[float] = Field(None, ge=0)
    water_saved_liters: Optional[float] = Field(None, ge=0)
    textile_recycled_kg: Optional[float] = Field(None, ge=0)
    trees_equivalent: Optional[float] = Field(None, ge=0)
    sustainability_score: Optional[float] = Field(None, ge=0, le=100)
    certification: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
