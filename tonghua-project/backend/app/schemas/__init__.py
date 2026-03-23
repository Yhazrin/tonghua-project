"""Tonghua API Schemas — re-exports from individual schema modules."""

# Common / base schemas
from app.schemas.common import (
    ApiResponse,
    AuditLogOut,
    DashboardMetrics,
    LoginRequest,
    PaginatedResponse,
    RefreshRequest,
    RegisterRequest,
    SettingsUpdate,
    TokenResponse,
)

# User & Child participant
from app.schemas.user import (
    ChildParticipantCreate,
    ChildParticipantOut,
    ChildParticipantUpdate,
    UserCreate,
    UserOut,
    UserOutSensitive,
    UserRoleUpdate,
    UserStatusUpdate,
    UserUpdate,
)

# Artwork
from app.schemas.artwork import (
    ArtworkCreate,
    ArtworkListItem,
    ArtworkOut,
    ArtworkStatusUpdate,
    ArtworkUpdate,
)

# Campaign
from app.schemas.campaign import (
    CampaignCreate,
    CampaignListItem,
    CampaignOut,
    CampaignUpdate,
)

# Donation
from app.schemas.donation import (
    DonationCreate,
    DonationListItem,
    DonationOut,
)

# Product
from app.schemas.product import (
    ProductCreate,
    ProductListItem,
    ProductOut,
    ProductUpdate,
)

# Order
from app.schemas.order import (
    OrderCreate,
    OrderItemCreate,
    OrderItemOut,
    OrderListItem,
    OrderOut,
    OrderStatusUpdate,
)

# Payment
from app.schemas.payment import (
    PaymentCallback,
    PaymentCreate,
    PaymentListItem,
    PaymentOut,
)

# Common payment schemas
from app.schemas.payment_common import (
    WeChatPaymentParams,
)

# Supply chain
from app.schemas.supply_chain import (
    SupplyChainRecordCreate,
    SupplyChainRecordOut,
    SupplyChainRecordUpdate,
    SupplyChainTrace,
)

# Logistics
from app.schemas.logistics import (
    LogisticsCreate,
    LogisticsEventCreate,
    LogisticsEventOut,
    LogisticsRecordOut,
    LogisticsUpdate,
)

# Reviews
from app.schemas.review import (
    ReviewCreate,
    ReviewOut,
    ReviewSummary,
    ReviewUpdate,
)

# After Sales
from app.schemas.after_sales import (
    AfterSalesCreate,
    AfterSalesMessageCreate,
    AfterSalesMessageOut,
    AfterSalesOut,
    AfterSalesUpdate,
)

# AI Assistant & Sustainability
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

__all__ = [
    # Common
    "ApiResponse",
    "PaginatedResponse",
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "RefreshRequest",
    "AuditLogOut",
    "DashboardMetrics",
    "SettingsUpdate",
    # User
    "UserCreate",
    "UserUpdate",
    "UserOut",
    "UserOutSensitive",
    "UserRoleUpdate",
    "UserStatusUpdate",
    "ChildParticipantCreate",
    "ChildParticipantUpdate",
    "ChildParticipantOut",
    # Artwork
    "ArtworkCreate",
    "ArtworkUpdate",
    "ArtworkStatusUpdate",
    "ArtworkListItem",
    "ArtworkOut",
    # Campaign
    "CampaignCreate",
    "CampaignUpdate",
    "CampaignListItem",
    "CampaignOut",
    # Donation
    "DonationCreate",
    "DonationListItem",
    "DonationOut",
    # Product
    "ProductCreate",
    "ProductUpdate",
    "ProductListItem",
    "ProductOut",
    # Order
    "OrderCreate",
    "OrderItemCreate",
    "OrderItemOut",
    "OrderStatusUpdate",
    "OrderListItem",
    "OrderOut",
    "WeChatPaymentParams",
    # Payment
    "PaymentCreate",
    "PaymentCallback",
    "PaymentListItem",
    "PaymentOut",
    # Supply chain
    "SupplyChainRecordCreate",
    "SupplyChainRecordUpdate",
    "SupplyChainRecordOut",
    "SupplyChainTrace",
    # Logistics
    "LogisticsCreate",
    "LogisticsUpdate",
    "LogisticsEventCreate",
    "LogisticsEventOut",
    "LogisticsRecordOut",
    # Reviews
    "ReviewCreate",
    "ReviewUpdate",
    "ReviewOut",
    "ReviewSummary",
    # After Sales
    "AfterSalesCreate",
    "AfterSalesUpdate",
    "AfterSalesMessageCreate",
    "AfterSalesMessageOut",
    "AfterSalesOut",
    # AI & Sustainability
    "AIChatRequest",
    "AIChatResponse",
    "AIFeedbackRequest",
    "ClothingDonationCreate",
    "ClothingDonationUpdate",
    "ClothingDonationOut",
    "SustainabilityMetricCreate",
    "SustainabilityMetricOut",
]
