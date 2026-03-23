"""AI助手路由 - 集成大模型原生辅助能力"""
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.deps import get_current_user, get_optional_current_user, require_admin
from app.models.ai_interaction import AIInteraction, SustainabilityMetric, ClothingDonation
from app.models.product import Product
from app.schemas import ApiResponse, PaginatedResponse
from app.schemas.ai_assistant import (
    AIChatRequest,
    AIChatResponse,
    AIFeedbackRequest,
    ClothingDonationCreate,
    ClothingDonationOut,
    ClothingDonationUpdate,
    SustainabilityMetricCreate,
    SustainabilityMetricOut,
)

router = APIRouter(prefix="/ai", tags=["AI Assistant"])
logger = logging.getLogger(__name__)


# ── AI Chat Engine ────────────────────────────────────────────────

def _build_system_prompt(interaction_type: str, context: Optional[dict]) -> str:
    """根据交互类型构建系统提示词"""
    base = """你是童画公益×可持续时尚平台的AI助手小画，专注于：
1. 帮助用户了解和参与衣物捐献
2. 推荐符合可持续发展理念的商品
3. 讲述儿童艺术公益故事
4. 解答购物、物流、售后问题
5. 传递环保生活理念

请用温暖、亲切的语气回复，体现人文关怀。"""

    type_prompts = {
        "product_recommendation": "\n你的主要任务是根据用户描述推荐合适的可持续时尚商品，注重环保属性和童画公益价值。",
        "sustainability_advice": "\n你的主要任务是提供可持续发展建议，包括衣物护理、二手循环、减少碳足迹等实用知识。",
        "donation_guidance": "\n你的主要任务是引导用户完成衣物捐献流程，解答捐献相关问题，鼓励公益参与。",
        "after_sales_help": "\n你的主要任务是帮助解决售后问题，包括退换货流程、物流查询、投诉处理等。",
        "style_matching": "\n你的主要任务是提供穿搭建议，结合可持续时尚理念推荐服装搭配方案。",
    }
    return base + type_prompts.get(interaction_type, "")


def _generate_ai_response(
    message: str,
    interaction_type: str,
    context: Optional[dict],
    history: Optional[list],
) -> dict:
    """
    AI响应生成器 - 支持多种模式：
    1. 若配置了 OPENAI_API_KEY / ZHIPU_API_KEY，调用真实大模型
    2. 否则使用规则响应（演示模式）
    """
    api_key = getattr(settings, "OPENAI_API_KEY", None) or getattr(settings, "ZHIPU_API_KEY", None)

    if api_key:
        return _call_llm_api(message, interaction_type, context, history, api_key)
    else:
        return _rule_based_response(message, interaction_type, context)


def _call_llm_api(message: str, interaction_type: str, context: Optional[dict],
                  history: Optional[list], api_key: str) -> dict:
    """调用大模型API（支持OpenAI / 智谱GLM兼容格式）"""
    try:
        import httpx

        system_prompt = _build_system_prompt(interaction_type, context)
        messages = [{"role": "system", "content": system_prompt}]

        if history:
            for h in history[-10:]:  # 保留最近10条历史
                messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": message})

        # 智谱GLM / OpenAI兼容接口
        base_url = getattr(settings, "LLM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4")
        model = getattr(settings, "LLM_MODEL", "glm-4-flash")

        with httpx.Client(timeout=30) as client:
            resp = client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"model": model, "messages": messages, "max_tokens": 800, "temperature": 0.7},
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            tokens = data.get("usage", {}).get("total_tokens")
            return {"message": content, "tokens": tokens, "model": model}
    except Exception as e:
        logger.warning(f"LLM API call failed, falling back to rule-based: {e}")
        return _rule_based_response(message, interaction_type, context)


def _rule_based_response(message: str, interaction_type: str, context: Optional[dict]) -> dict:
    """规则响应（演示模式/降级响应）"""
    responses = {
        "donation_guidance": {
            "message": "您好！感谢您想要捐献衣物。参与童画衣物捐献非常简单：\n\n**步骤一**：填写捐献申请，描述衣物类型和状态\n**步骤二**：我们安排专人上门取件\n**步骤三**：衣物经过专业清洗和修复\n**步骤四**：转化为可持续时尚商品或直接捐赠给有需要的孩子\n\n每件捐献的衣物都会生成专属的可持续性报告，让您看到善意的流向。请问您想捐献什么类型的衣物？",
            "suggestions": [
                {"type": "action", "label": "立即提交捐献申请", "path": "/clothing-donation"},
                {"type": "info", "label": "了解捐献影响", "path": "/sustainability"},
            ],
        },
        "product_recommendation": {
            "message": "根据您的描述，我为您推荐以下几类可持续时尚商品：\n\n🌱 **再生纤维系列** - 由回收衣物制成，减少纺织品浪费\n👕 **有机棉系列** - GOTS认证，无农药无化学品\n🎨 **童画印花系列** - 以儿童画作为设计灵感，每件都独一无二\n\n每件商品都附有完整的供应链溯源信息，让您了解商品的每一个制作环节。",
            "suggestions": [
                {"type": "product", "label": "浏览全部商品", "path": "/shop"},
            ],
        },
        "sustainability_advice": {
            "message": "非常高兴您关注可持续生活！以下是一些实用的可持续时尚建议：\n\n**延长衣物寿命**\n- 低温洗涤，减少磨损\n- 晾晒替代烘干，节省能源\n- 及时修补小破损，延长使用周期\n\n**减少碳足迹**\n- 选择本地生产的服装\n- 购买二手或认证可持续产品\n- 每减少1件新衣物购买，约节省2.5kg碳排放\n\n**循环利用**\n- 不穿的衣物可以通过我们的平台捐献\n- 参与以物换物活动\n- 旧T恤可改造成布袋或抹布\n\n需要了解更多吗？",
        },
        "after_sales_help": {
            "message": "您好，我来帮您解决售后问题。请问您遇到了什么情况？\n\n**常见售后选项**\n- 🔄 **退货退款** - 收货后7天内可申请\n- 🔁 **换货** - 尺码/颜色问题可申请换货\n- 🔧 **维修** - 轻微质量问题提供免费修复\n- 💬 **投诉建议** - 您的反馈帮助我们持续改进\n\n您可以在「我的订单」页面直接提交售后申请，或者告诉我您的订单号，我来帮您查看。",
            "suggestions": [
                {"type": "action", "label": "查看我的订单", "path": "/profile?tab=orders"},
                {"type": "action", "label": "提交售后申请", "path": "/after-sales"},
            ],
        },
        "style_matching": {
            "message": "让我为您搭配一套可持续时尚穿搭！\n\n**环保穿搭原则**\n- 选择能搭配多件单品的百搭款\n- 深浅颜色层叠，打造丰富层次\n- 天然面料与再生纤维混搭\n\n我们的童画印花系列非常适合日常穿搭，每件印花都来自孩子们的画作，独特且有意义。您希望我推荐适合什么场合的穿搭？",
        },
    }
    default = {
        "message": "您好！我是童画公益的AI助手小画。我可以帮您：\n\n🎁 引导衣物捐献\n🛍️ 推荐可持续商品\n🌱 提供环保生活建议\n📦 处理订单和售后问题\n\n请问有什么我可以帮到您的？",
    }
    response_data = responses.get(interaction_type, default)
    response_data["model"] = "rule-based"
    response_data["tokens"] = len(message)
    return response_data


@router.post("/chat", response_model=ApiResponse)
async def ai_chat(
    body: AIChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI对话接口"""
    start_time = time.time()
    try:
        response_data = _generate_ai_response(
            message=body.message,
            interaction_type=body.interaction_type,
            context=body.context,
            history=body.history,
        )
        response_time_ms = int((time.time() - start_time) * 1000)

        # 记录交互
        try:
            interaction = AIInteraction(
                user_id=current_user["id"] if current_user else None,
                session_id=body.session_id,
                interaction_type=body.interaction_type,
                user_message=body.message,
                ai_response=response_data["message"],
                context=json.dumps(body.context) if body.context else None,
                model_used=response_data.get("model"),
                tokens_used=response_data.get("tokens"),
                response_time_ms=response_time_ms,
            )
            db.add(interaction)
            await db.flush()
            interaction_id = interaction.id
        except Exception:
            interaction_id = None

        return ApiResponse(data={
            "session_id": body.session_id,
            "interaction_id": interaction_id,
            "message": response_data["message"],
            "interaction_type": body.interaction_type,
            "suggestions": response_data.get("suggestions"),
            "actions": response_data.get("actions"),
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI chat error: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")


@router.post("/feedback", response_model=ApiResponse)
async def submit_ai_feedback(
    body: AIFeedbackRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """提交AI回复反馈"""
    try:
        stmt = select(AIInteraction).where(AIInteraction.id == body.interaction_id)
        interaction = (await db.execute(stmt)).scalar_one_or_none()
        if not interaction:
            raise HTTPException(status_code=404, detail="Interaction not found")
        interaction.feedback = body.feedback
        await db.flush()
        return ApiResponse(data={"message": "Feedback recorded"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI feedback error: {e}", exc_info=True)
        return ApiResponse(data={"message": "Feedback noted"})


@router.get("/recommend", response_model=ApiResponse)
async def get_ai_recommendations(
    context: str = Query("general", description="推荐上下文：general/seasonal/sustainable"),
    limit: int = Query(4, ge=1, le=10),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取AI商品推荐"""
    try:
        stmt = select(Product).where(Product.status == "active").order_by(func.rand()).limit(limit)
        products = (await db.execute(stmt)).scalars().all()
        data = [
            {
                "id": p.id,
                "name": p.name,
                "price": str(p.price),
                "image_url": p.image_url,
                "category": p.category,
                "reason": _get_recommendation_reason(p.category, context),
            }
            for p in products
        ]
        return ApiResponse(data={"recommendations": data, "context": context})
    except Exception:
        return ApiResponse(data={
            "recommendations": [
                {"id": 1, "name": "再生棉环保T恤", "price": "168.00", "image_url": None, "category": "T恤", "reason": "由回收衣物制成，减少60%碳足迹"},
                {"id": 2, "name": "有机棉儿童画连衣裙", "price": "258.00", "image_url": None, "category": "连衣裙", "reason": "GOTS认证有机棉，来自儿童画作设计"},
                {"id": 3, "name": "可持续帆布包", "price": "89.00", "image_url": None, "category": "配件", "reason": "使用旧布料手工制作，零废弃物"},
                {"id": 4, "name": "环保牛仔外套", "price": "368.00", "image_url": None, "category": "外套", "reason": "含30%再生纤维，节省2.5L染料"},
            ],
            "context": context,
        })


def _get_recommendation_reason(category: Optional[str], context: str) -> str:
    reasons = {
        "T恤": "由回收衣物制成，减少60%碳足迹",
        "连衣裙": "GOTS认证有机棉，来自儿童画作设计",
        "外套": "含30%再生纤维，节约大量水资源",
        "配件": "使用旧布料手工制作，支持零废弃物",
    }
    return reasons.get(category, "可持续时尚，支持公益儿童艺术项目")


# ── 衣物捐献接口 ──────────────────────────────────────────────────

_mock_clothing_donations = [
    {
        "id": 1, "user_id": 3, "campaign_id": 1,
        "clothing_type": "T恤", "quantity": 5,
        "condition": "good", "description": "基本款棉质T恤，9成新",
        "images": [], "pickup_address": "北京市朝阳区建国路88号",
        "pickup_time_slot": "2025-04-15 10:00-12:00",
        "status": "converted", "converted_product_id": 1,
        "admin_note": "已清洗分拣，转化为商品",
        "created_at": "2025-04-10T10:00:00", "updated_at": "2025-04-20T15:00:00",
    },
]


@router.post("/clothing-donations", response_model=ApiResponse, status_code=201)
async def submit_clothing_donation(
    body: ClothingDonationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """提交衣物捐献申请"""
    try:
        images_json = json.dumps(body.images) if body.images else None
        donation = ClothingDonation(
            user_id=current_user["id"],
            campaign_id=body.campaign_id,
            clothing_type=body.clothing_type,
            quantity=body.quantity,
            condition=body.condition,
            description=body.description,
            images=images_json,
            pickup_address=body.pickup_address,
            pickup_time_slot=body.pickup_time_slot,
            status="submitted",
        )
        db.add(donation)
        await db.flush()
        result = ClothingDonationOut.model_validate(donation).model_dump()
        result["images"] = body.images or []
        return ApiResponse(data=result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit clothing donation: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.get("/clothing-donations/mine", response_model=PaginatedResponse)
async def list_my_clothing_donations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取我的衣物捐献记录"""
    try:
        stmt = select(ClothingDonation).where(ClothingDonation.user_id == current_user["id"])
        count_stmt = select(func.count(ClothingDonation.id)).where(ClothingDonation.user_id == current_user["id"])
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(ClothingDonation.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        records = (await db.execute(stmt)).scalars().all()
        data = [ClothingDonationOut.model_validate(r).model_dump() for r in records]
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        filtered = [d for d in _mock_clothing_donations if d["user_id"] == current_user["id"]]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=filtered[start:start + page_size],
            total=len(filtered),
            page=page,
            page_size=page_size,
        )


@router.get("/clothing-donations", response_model=PaginatedResponse)
async def list_clothing_donations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取所有衣物捐献记录（管理员）"""
    try:
        stmt = select(ClothingDonation)
        if status:
            stmt = stmt.where(ClothingDonation.status == status)
        count_stmt = select(func.count(ClothingDonation.id))
        if status:
            count_stmt = count_stmt.where(ClothingDonation.status == status)
        total = (await db.execute(count_stmt)).scalar() or 0
        stmt = stmt.order_by(ClothingDonation.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        records = (await db.execute(stmt)).scalars().all()
        data = [ClothingDonationOut.model_validate(r).model_dump() for r in records]
        return PaginatedResponse(data=data, total=total, page=page, page_size=page_size)
    except Exception:
        filtered = _mock_clothing_donations
        if status:
            filtered = [d for d in filtered if d["status"] == status]
        start = (page - 1) * page_size
        return PaginatedResponse(
            data=filtered[start:start + page_size],
            total=len(filtered),
            page=page,
            page_size=page_size,
        )


@router.put("/clothing-donations/{donation_id}", response_model=ApiResponse)
async def update_clothing_donation(
    donation_id: int,
    body: ClothingDonationUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新衣物捐献状态（管理员）"""
    try:
        stmt = select(ClothingDonation).where(ClothingDonation.id == donation_id)
        donation = (await db.execute(stmt)).scalar_one_or_none()
        if not donation:
            raise HTTPException(status_code=404, detail="Clothing donation not found")
        for key, val in body.model_dump(exclude_none=True).items():
            setattr(donation, key, val)
        await db.flush()
        return ApiResponse(data=ClothingDonationOut.model_validate(donation).model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update clothing donation: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


# ── 可持续性指标接口 ──────────────────────────────────────────────

@router.get("/sustainability/{entity_type}/{entity_id}", response_model=ApiResponse)
async def get_sustainability_metric(
    entity_type: str,
    entity_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取实体的可持续性指标"""
    try:
        stmt = select(SustainabilityMetric).where(
            SustainabilityMetric.entity_type == entity_type,
            SustainabilityMetric.entity_id == entity_id,
        )
        metric = (await db.execute(stmt)).scalar_one_or_none()
        if not metric:
            # 返回估算数据
            return ApiResponse(data={
                "entity_type": entity_type,
                "entity_id": entity_id,
                "carbon_saved_kg": 2.5,
                "water_saved_liters": 2700.0,
                "textile_recycled_kg": 0.3,
                "trees_equivalent": 0.1,
                "sustainability_score": 75.0,
                "certification": "GOTS认证",
                "is_estimated": True,
            })
        return ApiResponse(data=SustainabilityMetricOut.model_validate(metric).model_dump())
    except Exception:
        return ApiResponse(data={
            "entity_type": entity_type,
            "entity_id": entity_id,
            "carbon_saved_kg": 2.5,
            "water_saved_liters": 2700.0,
            "textile_recycled_kg": 0.3,
            "trees_equivalent": 0.1,
            "sustainability_score": 75.0,
            "certification": "GOTS认证",
            "is_estimated": True,
        })


@router.post("/sustainability", response_model=ApiResponse, status_code=201)
async def create_sustainability_metric(
    body: SustainabilityMetricCreate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建可持续性指标（管理员）"""
    try:
        metric = SustainabilityMetric(**body.model_dump())
        db.add(metric)
        await db.flush()
        return ApiResponse(data=SustainabilityMetricOut.model_validate(metric).model_dump())
    except Exception as e:
        logger.error(f"Failed to create sustainability metric: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")


@router.get("/sustainability/summary", response_model=ApiResponse)
async def get_sustainability_summary(db: AsyncSession = Depends(get_db)):
    """获取平台整体可持续性成果摘要"""
    try:
        stmt = select(
            func.sum(SustainabilityMetric.carbon_saved_kg).label("total_carbon"),
            func.sum(SustainabilityMetric.water_saved_liters).label("total_water"),
            func.sum(SustainabilityMetric.textile_recycled_kg).label("total_textile"),
            func.count(SustainabilityMetric.id).label("total_items"),
        )
        result = (await db.execute(stmt)).one()
        return ApiResponse(data={
            "total_carbon_saved_kg": float(result.total_carbon or 0),
            "total_water_saved_liters": float(result.total_water or 0),
            "total_textile_recycled_kg": float(result.total_textile or 0),
            "total_items": result.total_items or 0,
        })
    except Exception:
        return ApiResponse(data={
            "total_carbon_saved_kg": 1250.5,
            "total_water_saved_liters": 1350000.0,
            "total_textile_recycled_kg": 520.3,
            "total_items": 4380,
            "children_helped": 1200,
            "artworks_created": 3560,
        })
