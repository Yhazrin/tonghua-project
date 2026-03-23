from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Boolean, func
from app.database import Base


class ProductReview(Base):
    """商品评价，关联订单项，确保购买后才能评价"""
    __tablename__ = "product_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5星
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    sustainability_rating = Column(Integer, nullable=True)  # 可持续性评分 1-5
    sustainability_comment = Column(Text, nullable=True)
    is_verified_purchase = Column(Boolean, default=True, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    status = Column(
        Enum("pending", "approved", "rejected", name="review_status"),
        default="pending",
        nullable=False,
    )
    admin_note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class ReviewHelpful(Base):
    """评价点赞记录"""
    __tablename__ = "review_helpful"

    id = Column(Integer, primary_key=True, autoincrement=True)
    review_id = Column(Integer, ForeignKey("product_reviews.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
