from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Float, func
from app.database import Base


class AIInteraction(Base):
    """AI交互记录，记录用户与AI助手的对话"""
    __tablename__ = "ai_interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    interaction_type = Column(
        Enum(
            "chat",                    # 普通对话
            "product_recommendation",  # 商品推荐
            "sustainability_advice",   # 可持续性建议
            "donation_guidance",       # 捐献引导
            "after_sales_help",        # 售后帮助
            "style_matching",          # 穿搭匹配
            name="ai_interaction_type"
        ),
        nullable=False,
        default="chat",
    )
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    context = Column(Text, nullable=True)    # JSON: 上下文信息（产品ID、订单ID等）
    feedback = Column(Enum("helpful", "not_helpful", name="ai_feedback"), nullable=True)
    model_used = Column(String(100), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class SustainabilityMetric(Base):
    """可持续性指标，记录每个商品/捐赠的环保数据"""
    __tablename__ = "sustainability_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(
        Enum("product", "donation", "order", name="sustainability_entity_type"),
        nullable=False,
    )
    entity_id = Column(Integer, nullable=False, index=True)
    carbon_saved_kg = Column(Float, nullable=True)         # 减少碳排放(kg)
    water_saved_liters = Column(Float, nullable=True)      # 节约用水(升)
    textile_recycled_kg = Column(Float, nullable=True)     # 纺织品回收(kg)
    trees_equivalent = Column(Float, nullable=True)        # 等效种树数量
    sustainability_score = Column(Float, nullable=True)    # 综合可持续性评分 0-100
    certification = Column(String(200), nullable=True)     # 认证信息（GOTS/Oeko-Tex等）
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class ClothingDonation(Base):
    """衣物捐献申请，这是整个流程的起点"""
    __tablename__ = "clothing_donations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True, index=True)
    clothing_type = Column(String(100), nullable=False)     # 服装类型
    quantity = Column(Integer, default=1, nullable=False)   # 件数
    condition = Column(
        Enum("new", "like_new", "good", "fair", name="clothing_condition"),
        nullable=False,
    )
    description = Column(Text, nullable=True)
    images = Column(Text, nullable=True)                    # JSON array of image URLs
    pickup_address = Column(Text, nullable=True)
    pickup_time_slot = Column(String(100), nullable=True)   # 期望取件时间段
    status = Column(
        Enum(
            "submitted",    # 已提交
            "scheduled",    # 已安排取件
            "picked_up",    # 已取件
            "processing",   # 处理中（清洗/分拣）
            "converted",    # 已转化为商品
            "completed",    # 完成
            "rejected",     # 不符合标准，已拒绝
            name="clothing_donation_status"
        ),
        default="submitted",
        nullable=False,
    )
    converted_product_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # 转化后的商品
    sustainability_metric_id = Column(Integer, ForeignKey("sustainability_metrics.id"), nullable=True)
    admin_note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
