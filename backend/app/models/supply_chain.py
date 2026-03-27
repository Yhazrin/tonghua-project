from sqlalchemy import (
    Column, Integer, String, DateTime, Text, DECIMAL, Enum, Boolean, JSON,
    ForeignKey, func,
)
from app.database import Base


class SupplyChainRecord(Base):
    """供应链记录 — PRD 5.5 供应链管理模块

    棉花采购记录、地图 API 标注、供应商档案。
    """
    __tablename__ = "supply_chain_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)

    # ── 采购信息 — PRD 5.5 ────────────────────────────────────
    origin_name = Column(String(200), nullable=True)      # 产地名称
    origin_lat = Column(DECIMAL(10, 7), nullable=True)    # 纬度
    origin_lng = Column(DECIMAL(10, 7), nullable=True)    # 经度
    purchase_qty_ton = Column(DECIMAL(10, 2), nullable=True)  # 采购量（吨）
    purchase_price_per_ton = Column(DECIMAL(12, 2), nullable=True)
    transport_distance_km = Column(DECIMAL(10, 2), nullable=True)  # 物流运距 KM
    carbon_estimate_kg = Column(DECIMAL(10, 2), nullable=True)     # 碳排放估算 kg
    purchase_date = Column(DateTime, nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)

    # ── 兼容旧字段 ────────────────────────────────────────────
    stage = Column(
        Enum(
            "material_sourcing", "processing", "manufacturing",
            "quality_check", "shipping",
            name="supply_chain_stage",
        ),
        nullable=True,
    )
    description = Column(Text, nullable=True)
    location = Column(String(300), nullable=True)
    certified = Column(Boolean, default=False, nullable=False)
    cert_image_url = Column(String(500), nullable=True)
    timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class Supplier(Base):
    """供应商档案 — PRD 5.5 供应商透明档案

    SA8000/BSCI 认证到期前 30 天自动消息提醒管理员。
    公平薪酬数据脱敏展示。
    """
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(100), nullable=True)
    contact_phone_encrypted = Column(Text, nullable=True)  # AES 加密
    region = Column(String(200), nullable=True)

    # ── 认证信息 ──────────────────────────────────────────────
    sa8000_cert_no = Column(String(100), nullable=True)
    sa8000_expiry = Column(DateTime, nullable=True)
    bsci_cert_no = Column(String(100), nullable=True)
    bsci_expiry = Column(DateTime, nullable=True)
    cert_image_url = Column(String(500), nullable=True)

    # ── 公平薪酬（脱敏） ─────────────────────────────────────
    avg_wage_level = Column(String(50), nullable=True)     # 薪酬水平档位（脱敏）
    worker_count = Column(Integer, nullable=True)
    improvement_notes = Column(Text, nullable=True)        # 工人薪酬改善数据

    status = Column(
        Enum("active", "inactive", "expired", name="supplier_status"),
        default="active",
        nullable=False,
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class Shipment(Base):
    """物流信息 — PRD 7.1 shipment 实体

    tracking_no 全局唯一。is_green 标记影响碳减排统计。
    超时 >72h 无轨迹自动预警。
    """
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    carrier_name = Column(String(100), nullable=False)     # 物流商名称
    tracking_no = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(
        Enum(
            "pending",       # 待发货
            "shipped",       # 已发货
            "in_transit",    # 运输中
            "delivering",    # 派送中
            "delivered",     # 已签收
            name="shipment_status",
        ),
        default="pending",
        nullable=False,
    )
    is_green = Column(Boolean, default=False, nullable=False)  # 是否绿色物流（新能源车辆）
    updater_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    last_track_time = Column(DateTime, nullable=True)          # 最近轨迹时间（用于72h预警）
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
