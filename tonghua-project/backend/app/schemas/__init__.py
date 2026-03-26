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

# User & Child participant & Address & Admin
from app.schemas.user import (
    UserCreate,
    UserCreateByEmail,
    UserLoginBySms,
    UserLoginByWechat,
    UserUpdate,
    UserOut,
    UserOutWithPhone,
    UserOutSensitive,
    UserRoleUpdate,
    UserStatusUpdate,
    AdminUserCreate,
    AdminUserUpdate,
    AdminUserOut,
    AdminUserBatchImport,
    AddressCreate,
    AddressUpdate,
    AddressOut,
    ChildParticipantCreate,
    ChildParticipantUpdate,
    ChildParticipantOut,
    ChildParticipantOutSensitive,
    ChildParticipantFrontend,
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

# Vote & Design
from app.schemas.vote import (
    VoteCreate,
    InternalVoteCreate,
    VoteOut,
    VoteRecordOut,
    DesignCreate,
    DesignUpdate,
    DesignOut,
    DesignListItem,
)

# Recycle
from app.schemas.recycle import (
    RecycleOrderCreate,
    RecycleOrderUpdate,
    RecycleOrderOut,
    RecycleOrderListItem,
)

# Notification
from app.schemas.notification import (
    NotificationOut,
    NotificationMarkRead,
    UnreadCountOut,
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
    # User (C端)
    "UserCreate",
    "UserCreateByEmail",
    "UserLoginBySms",
    "UserLoginByWechat",
    "UserUpdate",
    "UserOut",
    "UserOutWithPhone",
    "UserOutSensitive",
    "UserRoleUpdate",
    "UserStatusUpdate",
    # Admin (B端)
    "AdminUserCreate",
    "AdminUserUpdate",
    "AdminUserOut",
    "AdminUserBatchImport",
    # Address
    "AddressCreate",
    "AddressUpdate",
    "AddressOut",
    # Child
    "ChildParticipantCreate",
    "ChildParticipantUpdate",
    "ChildParticipantOut",
    "ChildParticipantOutSensitive",
    "ChildParticipantFrontend",
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
    # Vote & Design
    "VoteCreate",
    "InternalVoteCreate",
    "VoteOut",
    "VoteRecordOut",
    "DesignCreate",
    "DesignUpdate",
    "DesignOut",
    "DesignListItem",
    # Recycle
    "RecycleOrderCreate",
    "RecycleOrderUpdate",
    "RecycleOrderOut",
    "RecycleOrderListItem",
    # Notification
    "NotificationOut",
    "NotificationMarkRead",
    "UnreadCountOut",
]
