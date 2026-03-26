from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificationOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationMarkRead(BaseModel):
    notification_ids: list[int] = Field(..., min_length=1, max_length=100)


class UnreadCountOut(BaseModel):
    total: int = 0
    vote_result: int = 0
    order_status: int = 0
    donation_update: int = 0
    recycle_status: int = 0
    system: int = 0
