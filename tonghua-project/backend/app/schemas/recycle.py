from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class RecycleOrderCreate(BaseModel):
    """用户提交旧衣回收预约"""
    related_order_id: Optional[int] = Field(None, description="关联购买订单 ID")
    pickup_address: str = Field(..., min_length=1, max_length=500, description="回收地址")
    pickup_contact: str = Field(..., min_length=1, max_length=200, description="联系人+电话")
    pickup_time: datetime = Field(..., description="预约回收时间")
    note: Optional[str] = Field(None, max_length=500)


class RecycleOrderUpdate(BaseModel):
    """物流岗更新回收状态"""
    status: Optional[str] = Field(
        None, pattern="^(pending|picked_up|sorting|completed|cancelled)$"
    )
    good_qty: Optional[int] = Field(None, ge=0)
    damaged_qty: Optional[int] = Field(None, ge=0)
    fiber_kg: Optional[Decimal] = Field(None, ge=0)
    carbon_saved_kg: Optional[Decimal] = Field(None, ge=0)
    actual_pickup_time: Optional[datetime] = None
    note: Optional[str] = Field(None, max_length=500)


class RecycleOrderOut(BaseModel):
    id: int
    recycle_no: str
    user_id: int
    related_order_id: Optional[int] = None
    pickup_time: datetime
    actual_pickup_time: Optional[datetime] = None
    status: str
    good_qty: int
    damaged_qty: int
    fiber_kg: Decimal
    carbon_saved_kg: Decimal
    note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class RecycleOrderListItem(BaseModel):
    id: int
    recycle_no: str
    status: str
    pickup_time: datetime
    good_qty: int
    damaged_qty: int
    fiber_kg: Decimal
    carbon_saved_kg: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}
