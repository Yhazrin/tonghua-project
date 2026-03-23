"""物流追踪路由 - 管理订单物流信息和追踪事件"""
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.logistics import LogisticsRecord, LogisticsEvent
from app.models.order import Order
from app.schemas import ApiResponse, PaginatedResponse
from app.schemas.logistics import (
    LogisticsCreate,
    LogisticsEventCreate,
    LogisticsEventOut,
    LogisticsRecordOut,
    LogisticsUpdate,
)

router = APIRouter(prefix="/logistics", tags=["Logistics"])
logger = logging.getLogger(__name__)

# ── Mock data (fallback when DB unavailable) ─────────────────────
_mock_logistics = [
    {
        "id": 1, "order_id": 1, "tracking_no": "SF1234567890",
        "carrier": "顺丰速运", "status": "delivered",
        "current_location": "北京朝阳区配送中心",
        "description": "已签收",
        "estimated_delivery": "2025-04-03T18:00:00",
        "delivered_at": "2025-04-03T14:30:00",
        "events": [
            {"id": 1, "logistics_id": 1, "status": "picked_up", "location": "深圳南山区", "description": "已揽收", "event_time": "2025-04-01T10:00:00"},
            {"id": 2, "logistics_id": 1, "status": "in_transit", "location": "深圳转运中心", "description": "到达深圳中转站", "event_time": "2025-04-01T18:00:00"},
            {"id": 3, "logistics_id": 1, "status": "in_transit", "location": "北京分拨中心", "description": "到达北京分拨中心", "event_time": "2025-04-02T22:00:00"},
            {"id": 4, "logistics_id": 1, "status": "out_for_delivery", "location": "北京朝阳区配送中心", "description": "派送中，预计今日送达", "event_time": "2025-04-03T09:00:00"},
            {"id": 5, "logistics_id": 1, "status": "delivered", "location": "北京市朝阳区建国路88号", "description": "已签收，签收人：本人", "event_time": "2025-04-03T14:30:00"},
        ],
        "created_at": "2025-04-01T09:00:00", "updated_at": "2025-04-03T14:30:00",
    },
    {
        "id": 2, "order_id": 2, "tracking_no": "YT9876543210",
        "carrier": "圆通速递", "status": "in_transit",
        "current_location": "上海转运中心",
        "description": "运输中",
        "estimated_delivery": "2025-04-08T18:00:00",
        "delivered_at": None,
        "events": [
            {"id": 6, "logistics_id": 2, "status": "picked_up", "location": "广州天河区", "description": "已揽收", "event_time": "2025-04-06T10:00:00"},
            {"id": 7, "logistics_id": 2, "status": "in_transit", "location": "上海转运中心", "description": "到达上海中转站", "event_time": "2025-04-07T20:00:00"},
        ],
        "created_at": "2025-04-06T09:00:00", "updated_at": "2025-04-07T20:00:00",
    },
]


@router.get("/order/{order_id}", response_model=ApiResponse)
async def get_order_logistics(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取订单物流信息"""
    try:
        # 验证订单归属
        order_stmt = select(Order).where(Order.id == order_id)
        order_result = await db.execute(order_stmt)
        order = order_result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if current_user.get("role") != "admin" and order.user_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

        stmt = select(LogisticsRecord).where(LogisticsRecord.order_id == order_id)
        result = await db.execute(stmt)
        logistics = result.scalar_one_or_none()
        if not logistics:
            raise HTTPException(status_code=404, detail="Logistics record not found")

        events_stmt = select(LogisticsEvent).where(
            LogisticsEvent.logistics_id == logistics.id
        ).order_by(LogisticsEvent.event_time.desc())
        events_result = await db.execute(events_stmt)
        events = events_result.scalars().all()

        data = LogisticsRecordOut.model_validate(logistics).model_dump()
        data["events"] = [LogisticsEventOut.model_validate(e).model_dump() for e in events]
        return ApiResponse(data=data)
    except HTTPException:
        raise
    except Exception:
        for logi in _mock_logistics:
            if logi["order_id"] == order_id:
                return ApiResponse(data=logi)
        raise HTTPException(status_code=404, detail="Logistics record not found")


@router.get("/{logistics_id}", response_model=ApiResponse)
async def get_logistics_detail(
    logistics_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取物流详情"""
    try:
        stmt = select(LogisticsRecord).where(LogisticsRecord.id == logistics_id)
        result = await db.execute(stmt)
        logistics = result.scalar_one_or_none()
        if not logistics:
            raise HTTPException(status_code=404, detail="Logistics not found")

        # 验证权限
        order_stmt = select(Order).where(Order.id == logistics.order_id)
        order = (await db.execute(order_stmt)).scalar_one_or_none()
        if order and current_user.get("role") != "admin" and order.user_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

        events_stmt = select(LogisticsEvent).where(
            LogisticsEvent.logistics_id == logistics.id
        ).order_by(LogisticsEvent.event_time.desc())
        events = (await db.execute(events_stmt)).scalars().all()

        data = LogisticsRecordOut.model_validate(logistics).model_dump()
        data["events"] = [LogisticsEventOut.model_validate(e).model_dump() for e in events]
        return ApiResponse(data=data)
    except HTTPException:
        raise
    except Exception:
        for logi in _mock_logistics:
            if logi["id"] == logistics_id:
                return ApiResponse(data=logi)
        raise HTTPException(status_code=404, detail="Logistics not found")


@router.post("", response_model=ApiResponse, status_code=201)
async def create_logistics(
    body: LogisticsCreate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建物流记录（管理员）"""
    try:
        logistics = LogisticsRecord(**body.model_dump())
        db.add(logistics)
        await db.flush()
        # 自动将订单状态更新为已发货
        if body.status in ("picked_up", "in_transit"):
            order_stmt = select(Order).where(Order.id == body.order_id)
            order = (await db.execute(order_stmt)).scalar_one_or_none()
            if order and order.status == "processing":
                order.status = "shipped"
                order.shipped_at = datetime.now(timezone.utc)
        return ApiResponse(data=LogisticsRecordOut.model_validate(logistics).model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create logistics: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.put("/{logistics_id}", response_model=ApiResponse)
async def update_logistics(
    logistics_id: int,
    body: LogisticsUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新物流状态（管理员）"""
    try:
        stmt = select(LogisticsRecord).where(LogisticsRecord.id == logistics_id)
        logistics = (await db.execute(stmt)).scalar_one_or_none()
        if not logistics:
            raise HTTPException(status_code=404, detail="Logistics not found")

        update_data = body.model_dump(exclude_none=True)
        for key, val in update_data.items():
            setattr(logistics, key, val)

        # 自动同步订单状态
        if body.status == "delivered":
            order_stmt = select(Order).where(Order.id == logistics.order_id)
            order = (await db.execute(order_stmt)).scalar_one_or_none()
            if order and order.status == "shipped":
                order.status = "delivered"
                order.delivered_at = datetime.now(timezone.utc)

        await db.flush()
        return ApiResponse(data=LogisticsRecordOut.model_validate(logistics).model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update logistics: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.post("/{logistics_id}/events", response_model=ApiResponse, status_code=201)
async def add_logistics_event(
    logistics_id: int,
    body: LogisticsEventCreate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """添加物流轨迹事件（管理员）"""
    try:
        logistics_stmt = select(LogisticsRecord).where(LogisticsRecord.id == logistics_id)
        logistics = (await db.execute(logistics_stmt)).scalar_one_or_none()
        if not logistics:
            raise HTTPException(status_code=404, detail="Logistics not found")

        event = LogisticsEvent(logistics_id=logistics_id, **body.model_dump())
        db.add(event)

        # 同步最新状态到主记录
        logistics.status = body.status
        if body.location:
            logistics.current_location = body.location
        if body.description:
            logistics.description = body.description

        await db.flush()
        return ApiResponse(data=LogisticsEventOut.model_validate(event).model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add logistics event: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.get("", response_model=PaginatedResponse)
async def list_logistics(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取所有物流记录（管理员）"""
    try:
        stmt = select(LogisticsRecord)
        if status:
            stmt = stmt.where(LogisticsRecord.status == status)
        count_stmt = select(func.count(LogisticsRecord.id))
        if status:
            count_stmt = count_stmt.where(LogisticsRecord.status == status)
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(LogisticsRecord.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
        records = (await db.execute(stmt)).scalars().all()
        data = [LogisticsRecordOut.model_validate(r).model_dump() for r in records]
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        filtered = _mock_logistics
        if status:
            filtered = [l for l in filtered if l["status"] == status]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=filtered[start:start + page_size],
            total=len(filtered),
            page=page,
            page_size=page_size,
        )
