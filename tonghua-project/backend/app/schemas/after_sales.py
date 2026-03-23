from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class AfterSalesCreate(BaseModel):
    order_id: int
    request_type: str = Field(..., pattern="^(return|exchange|repair|complaint|inquiry)$")
    reason: str = Field(..., max_length=200)
    description: Optional[str] = None
    images: Optional[List[str]] = None


class AfterSalesUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        pattern="^(submitted|reviewing|approved|rejected|processing|completed)$"
    )
    refund_amount: Optional[Decimal] = Field(None, gt=0)
    refund_status: Optional[str] = Field(
        None, pattern="^(pending|processing|completed|failed)$"
    )
    admin_note: Optional[str] = None


class AfterSalesMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    images: Optional[List[str]] = None


class AfterSalesMessageOut(BaseModel):
    id: int
    request_id: int
    sender_id: int
    sender_role: str
    content: str
    images: Optional[List[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AfterSalesOut(BaseModel):
    id: int
    order_id: int
    user_id: int
    request_type: str
    reason: str
    description: Optional[str] = None
    images: Optional[List[str]] = None
    status: str
    refund_amount: Optional[Decimal] = None
    refund_status: Optional[str] = None
    admin_note: Optional[str] = None
    resolved_at: Optional[datetime] = None
    messages: List[AfterSalesMessageOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
