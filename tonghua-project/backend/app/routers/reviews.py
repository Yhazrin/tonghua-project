"""商品评价路由 - 支持购买后评价、可持续性评分"""
import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, get_optional_current_user, require_admin
from app.models.review import ProductReview, ReviewHelpful
from app.models.order import Order, OrderItem
from app.schemas import ApiResponse, PaginatedResponse
from app.schemas.review import ReviewCreate, ReviewOut, ReviewSummary, ReviewUpdate

router = APIRouter(prefix="/reviews", tags=["Reviews"])
logger = logging.getLogger(__name__)

# ── Mock data ─────────────────────────────────────────────────────
_mock_reviews = [
    {
        "id": 1, "product_id": 1, "order_id": 1, "user_id": 3,
        "rating": 5, "title": "品质超出预期",
        "content": "面料手感很好，做工精细，穿起来非常舒适。最重要的是知道这件衣服来自公益回收，穿着很有意义！",
        "images": [], "sustainability_rating": 5,
        "sustainability_comment": "很高兴能为环保做贡献，希望这个项目越做越好",
        "is_verified_purchase": True, "is_anonymous": False,
        "helpful_count": 12, "status": "approved",
        "created_at": "2025-04-10T10:00:00",
    },
    {
        "id": 2, "product_id": 2, "order_id": 5, "user_id": 4,
        "rating": 4, "title": "很不错的公益商品",
        "content": "颜色比图片稍微深一些，但质量很好。下次还会购买支持这个活动。",
        "images": [], "sustainability_rating": 4,
        "sustainability_comment": "了解到背后的故事，很感动",
        "is_verified_purchase": True, "is_anonymous": False,
        "helpful_count": 8, "status": "approved",
        "created_at": "2025-04-22T14:00:00",
    },
    {
        "id": 3, "product_id": 1, "order_id": 5, "user_id": 4,
        "rating": 5, "title": "超值",
        "content": "性价比很高，又支持了公益。",
        "images": [], "sustainability_rating": 5,
        "sustainability_comment": None,
        "is_verified_purchase": True, "is_anonymous": True,
        "helpful_count": 3, "status": "approved",
        "created_at": "2025-04-23T09:00:00",
    },
]


def _parse_images(images_field) -> list:
    if not images_field:
        return []
    if isinstance(images_field, list):
        return images_field
    try:
        return json.loads(images_field)
    except Exception:
        return []


@router.get("/product/{product_id}", response_model=PaginatedResponse)
async def list_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str = Query("approved"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_current_user),
):
    """获取商品评价列表"""
    try:
        stmt = select(ProductReview).where(ProductReview.product_id == product_id)
        if status:
            stmt = stmt.where(ProductReview.status == status)
        count_stmt = select(func.count(ProductReview.id)).where(
            ProductReview.product_id == product_id
        )
        if status:
            count_stmt = count_stmt.where(ProductReview.status == status)
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(ProductReview.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        reviews = (await db.execute(stmt)).scalars().all()
        data = []
        for r in reviews:
            item = ReviewOut.model_validate(r).model_dump()
            item["images"] = _parse_images(r.images)
            if r.is_anonymous:
                item["user_id"] = 0
            data.append(item)
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        filtered = [r for r in _mock_reviews if r["product_id"] == product_id]
        if status:
            filtered = [r for r in filtered if r["status"] == status]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=filtered[start:start + page_size],
            total=len(filtered),
            page=page,
            page_size=page_size,
        )


@router.get("/product/{product_id}/summary", response_model=ApiResponse)
async def get_product_review_summary(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取商品评价摘要（平均分、分布等）"""
    try:
        stmt = select(
            func.count(ProductReview.id).label("total"),
            func.avg(ProductReview.rating).label("avg_rating"),
            func.avg(ProductReview.sustainability_rating).label("avg_sustainability"),
        ).where(
            and_(ProductReview.product_id == product_id, ProductReview.status == "approved")
        )
        result = (await db.execute(stmt)).one()

        dist_stmt = select(ProductReview.rating, func.count(ProductReview.id)).where(
            and_(ProductReview.product_id == product_id, ProductReview.status == "approved")
        ).group_by(ProductReview.rating)
        dist_result = (await db.execute(dist_stmt)).all()
        distribution = {str(i): 0 for i in range(1, 6)}
        for rating, count in dist_result:
            distribution[str(rating)] = count

        return ApiResponse(data={
            "product_id": product_id,
            "total_reviews": result.total or 0,
            "average_rating": round(float(result.avg_rating or 0), 1),
            "sustainability_avg": round(float(result.avg_sustainability or 0), 1) if result.avg_sustainability else None,
            "rating_distribution": distribution,
        })
    except Exception:
        mock = [r for r in _mock_reviews if r["product_id"] == product_id and r["status"] == "approved"]
        total = len(mock)
        avg = sum(r["rating"] for r in mock) / total if total else 0
        dist = {str(i): sum(1 for r in mock if r["rating"] == i) for i in range(1, 6)}
        return ApiResponse(data={
            "product_id": product_id,
            "total_reviews": total,
            "average_rating": round(avg, 1),
            "sustainability_avg": None,
            "rating_distribution": dist,
        })


@router.post("", response_model=ApiResponse, status_code=201)
async def create_review(
    body: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """提交商品评价（需已购买该商品）"""
    try:
        # 验证订单归属和购买记录
        order_stmt = select(Order).where(
            and_(Order.id == body.order_id, Order.user_id == current_user["id"])
        )
        order = (await db.execute(order_stmt)).scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.status not in ("delivered", "completed"):
            raise HTTPException(status_code=400, detail="Can only review after receiving the order")

        # 验证订单包含该商品
        item_stmt = select(OrderItem).where(
            and_(OrderItem.order_id == body.order_id, OrderItem.product_id == body.product_id)
        )
        item = (await db.execute(item_stmt)).scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=400, detail="Product not in this order")

        # 检查是否已评价过
        existing_stmt = select(ProductReview).where(
            and_(
                ProductReview.order_id == body.order_id,
                ProductReview.product_id == body.product_id,
                ProductReview.user_id == current_user["id"],
            )
        )
        existing = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="Already reviewed this product for this order")

        images_json = json.dumps(body.images) if body.images else None
        review = ProductReview(
            product_id=body.product_id,
            order_id=body.order_id,
            user_id=current_user["id"],
            rating=body.rating,
            title=body.title,
            content=body.content,
            images=images_json,
            sustainability_rating=body.sustainability_rating,
            sustainability_comment=body.sustainability_comment,
            is_verified_purchase=True,
            is_anonymous=body.is_anonymous,
            status="pending",
        )
        db.add(review)
        await db.flush()
        result = ReviewOut.model_validate(review).model_dump()
        result["images"] = body.images or []
        return ApiResponse(data=result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create review: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.post("/{review_id}/helpful", response_model=ApiResponse)
async def mark_review_helpful(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """标记评价有用"""
    try:
        review_stmt = select(ProductReview).where(ProductReview.id == review_id)
        review = (await db.execute(review_stmt)).scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        existing_stmt = select(ReviewHelpful).where(
            and_(ReviewHelpful.review_id == review_id, ReviewHelpful.user_id == current_user["id"])
        )
        existing = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="Already marked as helpful")

        helpful = ReviewHelpful(review_id=review_id, user_id=current_user["id"])
        db.add(helpful)
        review.helpful_count += 1
        await db.flush()
        return ApiResponse(data={"helpful_count": review.helpful_count})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to mark helpful: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.put("/{review_id}", response_model=ApiResponse)
async def update_review(
    review_id: int,
    body: ReviewUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新评价审核状态（管理员）"""
    try:
        stmt = select(ProductReview).where(ProductReview.id == review_id)
        review = (await db.execute(stmt)).scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        for key, val in body.model_dump(exclude_none=True).items():
            setattr(review, key, val)
        await db.flush()
        return ApiResponse(data=ReviewOut.model_validate(review).model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update review: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.get("/pending", response_model=PaginatedResponse)
async def list_pending_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取待审核评价（管理员）"""
    try:
        stmt = select(ProductReview).where(ProductReview.status == "pending")
        count_stmt = select(func.count(ProductReview.id)).where(ProductReview.status == "pending")
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(ProductReview.created_at.asc()).offset((page - 1) * page_size).limit(page_size)
        reviews = (await db.execute(stmt)).scalars().all()
        data = [ReviewOut.model_validate(r).model_dump() for r in reviews]
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        pending = [r for r in _mock_reviews if r["status"] == "pending"]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=pending[start:start + page_size],
            total=len(pending),
            page=page,
            page_size=page_size,
        )
