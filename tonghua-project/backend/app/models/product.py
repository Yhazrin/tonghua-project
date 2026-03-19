from sqlalchemy import Column, Integer, String, DateTime, Text, DECIMAL, Enum, ForeignKey, func
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(10), default="CNY", nullable=False)
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True, index=True)
    stock = Column(Integer, default=0, nullable=False)
    status = Column(
        Enum("active", "inactive", "sold_out", name="product_status"),
        default="active",
        nullable=False,
    )
    supply_chain_id = Column(Integer, ForeignKey("supply_chain_records.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
