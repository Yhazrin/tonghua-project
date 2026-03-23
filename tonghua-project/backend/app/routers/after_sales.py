"""售后服务路由 - 退货/换货/投诉处理"""
import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models.after_sales import AfterSalesRequest, AfterSalesMessage
from app.models.order import Order
from app.schemas import ApiResponse, PaginatedResponse
from app.schemas.after_sales import (
    AfterSalesCreate,
    AfterSalesMessageCreate,
    AfterSalesMessageOut,
    AfterSalesOut,
    AfterSalesUpdate,
)

router = APIRouter(prefix="/after-sales", tags=["After Sales"])
logger = logging.getLogger(__name__)

# ── Mock data ─────────────────────────────────────────────────────
_mock_requests = [
    {
        "id": 1, "order_id": 2, "user_id": 4,
        "request_type": "return",
        "reason": "尺码不合适",
        "description": "买的M码偏大，想换S码",
        "images": [], "status": "completed",
        "refund_amount": "258.00", "refund_status": "completed",
        "admin_note": "已处理，退款成功",
        "resolved_at": "2025-04-10T15:00:00",
        "messages": [
            {"id": 1, "request_id": 1, "sender_id": 4, "sender_role": "user", "content": "尺码偏大想退货，可以吗？", "images": [], "created_at": "2025-04-08T10:00:00"},
            {"id": 2, "request_id": 1, "sender_id": 1, "sender_role": "admin", "content": "您好，已为您处理退货申请，退款将在3个工作日内到账。", "images": [], "created_at": "2025-04-09T14:00:00"},
        ],
        "created_at": "2025-04-08T10:00:00", "updated_at": "2025-04-10T15:00:00",
    },
]


def _parse_images(val) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return val
    try:
        return json.loads(val)
    except Exception:
        return []


@router.get("/mine", response_model=PaginatedResponse)
async def list_my_after_sales(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取我的售后申请列表"""
    try:
        stmt = select(AfterSalesRequest).where(AfterSalesRequest.user_id == current_user["id"])
        if status:
            stmt = stmt.where(AfterSalesRequest.status == status)
        count_stmt = select(func.count(AfterSalesRequest.id)).where(
            AfterSalesRequest.user_id == current_user["id"]
        )
        if status:
            count_stmt = count_stmt.where(AfterSalesRequest.status == status)
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(AfterSalesRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        records = (await db.execute(stmt)).scalars().all()
        data = [AfterSalesOut.model_validate(r).model_dump() for r in records]
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        filtered = [r for r in _mock_requests if r["user_id"] == current_user["id"]]
        if status:
            filtered = [r for r in filtered if r["status"] == status]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=filtered[start:start + page_size],
            total=len(filtered),
            page=page,
            page_size=page_size,
        )


@router.post("", response_model=ApiResponse, status_code=201)
async def create_after_sales(
    body: AfterSalesCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """提交售后申请"""
    try:
        # 验证订单归属
        order_stmt = select(Order).where(
            and_(Order.id == body.order_id, Order.user_id == current_user["id"])
        )
        order = (await db.execute(order_stmt)).scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.status not in ("delivered", "completed", "shipped"):
            raise HTTPException(status_code=400, detail="After-sales only available for received orders")

        # 检查是否已有未解决的申请
        existing_stmt = select(AfterSalesRequest).where(
            and_(
                AfterSalesRequest.order_id == body.order_id,
                AfterSalesRequest.user_id == current_user["id"],
                AfterSalesRequest.status.notin_(["completed", "rejected"]),
            )
        )
        existing = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="An active after-sales request already exists for this order")

        images_json = json.dumps(body.images) if body.images else None
        request = AfterSalesRequest(
            order_id=body.order_id,
            user_id=current_user["id"],
            request_type=body.request_type,
            reason=body.reason,
            description=body.description,
            images=images_json,
            status="submitted",
        )
        db.add(request)
        await db.flush()
        result = AfterSalesOut.model_validate(request).model_dump()
        result["images"] = body.images or []
        result["messages"] = []
        return ApiResponse(data=result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create after-sales request: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.get("/{request_id}", response_model=ApiResponse)
async def get_after_sales(
    request_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取售后申请详情"""
    try:
        stmt = select(AfterSalesRequest).where(AfterSalesRequest.id == request_id)
        request = (await db.execute(stmt)).scalar_one_or_none()
        if not request:
            raise HTTPException(status_code=404, detail="After-sales request not found")
        if current_user.get("role") != "admin" and request.user_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

        msgs_stmt = select(AfterSalesMessage).where(
            AfterSalesMessage.request_id == request_id
        ).order_by(AfterSalesMessage.created_at.asc())
        msgs = (await db.execute(msgs_stmt)).scalars().all()

        data = AfterSalesOut.model_validate(request).model_dump()
        data["images"] = _parse_images(request.images)
        data["messages"] = [AfterSalesMessageOut.model_validate(m).model_dump() for m in msgs]
        return ApiResponse(data=data)
    except HTTPException:
        raise
    except Exception:
        for r in _mock_requests:
            if r["id"] == request_id:
                if current_user.get("role") != "admin" and r["user_id"] != current_user["id"]:
                    raise HTTPException(status_code=403, detail="Forbidden")
                return ApiResponse(data=r)
        raise HTTPException(status_code=404, detail="After-sales request not found")


@router.post("/{request_id}/messages", response_model=ApiResponse, status_code=201)
async def send_message(
    request_id: int,
    body: AfterSalesMessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发送售后沟通消息"""
    try:
        stmt = select(AfterSalesRequest).where(AfterSalesRequest.id == request_id)
        request = (await db.execute(stmt)).scalar_one_or_none()
        if not request:
            raise HTTPException(status_code=404, detail="After-sales request not found")
        if current_user.get("role") != "admin" and request.user_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Forbidden")
        if request.status in ("completed", "rejected"):
            raise HTTPException(status_code=400, detail="Cannot send message to closed request")

        sender_role = "admin" if current_user.get("role") == "admin" else "user"
        images_json = json.dumps(body.images) if body.images else None
        msg = AfterSalesMessage(
            request_id=request_id,
            sender_id=current_user["id"],
            sender_role=sender_role,
            content=body.content,
            images=images_json,
        )
        db.add(msg)

        # 若管理员回复，自动更新状态为审核中
        if sender_role == "admin" and request.status == "submitted":
            request.status = "reviewing"

        await db.flush()
        result = AfterSalesMessageOut.model_validate(msg).model_dump()
        result["images"] = body.images or []
        return ApiResponse(data=result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send message: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.put("/{request_id}", response_model=ApiResponse)
async def update_after_sales(
    request_id: int,
    body: AfterSalesUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新售后申请状态（管理员）"""
    try:
        stmt = select(AfterSalesRequest).where(AfterSalesRequest.id == request_id)
        request = (await db.execute(stmt)).scalar_one_or_none()
        if not request:
            raise HTTPException(status_code=404, detail="After-sales request not found")

        for key, val in body.model_dump(exclude_none=True).items():
            setattr(request, key, val)

        if body.status in ("completed", "rejected"):
            request.resolved_at = datetime.now(timezone.utc)

        await db.flush()
        return ApiResponse(data=AfterSalesOut.model_validate(request).model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update after-sales: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.get("", response_model=PaginatedResponse)
async def list_all_after_sales(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    request_type: Optional[str] = Query(None),
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取所有售后申请（管理员）"""
    try:
        stmt = select(AfterSalesRequest)
        if status:
            stmt = stmt.where(AfterSalesRequest.status == status)
        if request_type:
            stmt = stmt.where(AfterSalesRequest.request_type == request_type)
        count_stmt = select(func.count(AfterSalesRequest.id))
        if status:
            count_stmt = count_stmt.where(AfterSalesRequest.status == status)
        if request_type:
            count_stmt = count_stmt.where(AfterSalesRequest.request_type == request_type)
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(AfterSalesRequest.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        records = (await db.execute(stmt)).scalars().all()
        data = [AfterSalesOut.model_validate(r).model_dump() for r in records]
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        filtered = _mock_requests
        if status:
            filtered = [r for r in filtered if r["status"] == status]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=filtered[start:start + page_size],
            total=len(filtered),
            page=page,
            page_size=page_size,
        )
