from sqlalchemy import (
    Column, Integer, String, DateTime, Text, DECIMAL, Enum, Boolean,
    ForeignKey, func,
)
from app.database import Base


class Product(Base):
    """商品（慈善系列） — 保留兼容旧结构，新增 PRD 所需字段"""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(10), default="CNY", nullable=False)
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True, index=True)
    stock = Column(Integer, default=0, nullable=False)
    design_id = Column(Integer, ForeignKey("designs.id"), nullable=True, index=True)  # 关联终稿设计
    donation_ratio = Column(DECIMAL(3, 2), default=0.30, nullable=False)  # 固定 0.3
    status = Column(
        Enum("active", "inactive", "sold_out", name="product_status"),
        default="active",
        nullable=False,
    )
    supply_chain_id = Column(Integer, ForeignKey("supply_chain_records.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class ProductSku(Base):
    """商品 SKU — PRD 7.1 product_sku 实体

    一个商品可有多个 SKU（颜色/尺码组合）。
    donation_amount = price × donation_ratio，不允许手动修改。
    """
    __tablename__ = "product_skus"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    design_id = Column(Integer, ForeignKey("designs.id"), nullable=True, index=True)  # 关联终稿

    # ── SKU 属性 ──────────────────────────────────────────────
    color = Column(String(50), nullable=True)
    size = Column(String(20), nullable=True)
    sku_code = Column(String(100), unique=True, nullable=False, index=True)  # SKU 编码
    image_url = Column(String(500), nullable=True)  # SKU 专属图

    # ── 价格 & 捐赠 ──────────────────────────────────────────
    price = Column(DECIMAL(12, 2), nullable=False)
    donation_ratio = Column(DECIMAL(3, 2), default=0.30, nullable=False)  # 固定 0.3
    donation_amount = Column(DECIMAL(12, 2), nullable=False)             # = price × 0.3，自动计算

    # ── 库存 ──────────────────────────────────────────────────
    stock_qty = Column(Integer, default=0, nullable=False)

    # ── 状态 ──────────────────────────────────────────────────
    status = Column(
        Enum("on_sale", "off_shelf", name="sku_status"),
        default="on_sale",
        nullable=False,
    )

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
