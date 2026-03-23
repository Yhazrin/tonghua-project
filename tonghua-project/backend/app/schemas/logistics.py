from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class LogisticsEventOut(BaseModel):
    id: int
    logistics_id: int
    status: str
    location: Optional[str] = None
    description: Optional[str] = None
    event_time: datetime

    model_config = {"from_attributes": True}


class LogisticsRecordOut(BaseModel):
    id: int
    order_id: int
    tracking_no: Optional[str] = None
    carrier: Optional[str] = None
    status: str
    current_location: Optional[str] = None
    description: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    events: List[LogisticsEventOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LogisticsCreate(BaseModel):
    order_id: int
    tracking_no: Optional[str] = Field(None, max_length=100)
    carrier: Optional[str] = Field(None, max_length=100)
    status: str = Field("pending", pattern="^(pending|picked_up|in_transit|out_for_delivery|delivered|exception)$")
    current_location: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    estimated_delivery: Optional[datetime] = None


class LogisticsUpdate(BaseModel):
    tracking_no: Optional[str] = Field(None, max_length=100)
    carrier: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, pattern="^(pending|picked_up|in_transit|out_for_delivery|delivered|exception)$")
    current_location: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


class LogisticsEventCreate(BaseModel):
    status: str = Field(..., max_length=50)
    location: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    event_time: datetime
