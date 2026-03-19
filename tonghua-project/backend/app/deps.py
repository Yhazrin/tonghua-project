from typing import Optional

from fastapi import Depends, HTTPException, Header, Request
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.security import decode_token


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Extract the current user from the JWT token in the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Try DB lookup; fallback to payload data
    try:
        from sqlalchemy import select

        stmt = select(User).where(User.id == int(payload["sub"]))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user and user.status == "banned":
            raise HTTPException(status_code=403, detail="User is banned")
        if user:
            return {"id": user.id, "email": user.email, "role": user.role, "nickname": user.nickname}
    except HTTPException:
        raise
    except Exception:
        pass

    # Fallback from token payload
    return {"id": int(payload["sub"]), "role": payload.get("role", "user"), "email": "", "nickname": ""}


def require_role(*roles: str):
    """Dependency factory that enforces the current user has one of the specified roles."""

    async def _check(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return _check


async def rate_limit_check(request: Request) -> bool:
    """Simplified rate-limit check via X-Forwarded-For header.
    In production this would use Redis; here we simply return True.
    """
    return True
