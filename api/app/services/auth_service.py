from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole


async def get_user_by_google_id(
    db: AsyncSession,
    google_id: str,
) -> User | None:
    result = await db.execute(
        select(User).where(User.google_id == google_id)
    )

    return result.scalar_one_or_none()


async def get_or_create_google_user(
    db: AsyncSession,
    google_id: str,
    email: str,
    name: str,
    avatar_url: str | None,
) -> User:
    user = await get_user_by_google_id(
        db=db,
        google_id=google_id,
    )

    if user is not None:
        user.email = email
        user.name = name
        user.avatar_url = avatar_url

        await db.commit()
        await db.refresh(user)

        return user

    user = User(
        google_id=google_id,
        email=email,
        name=name,
        avatar_url=avatar_url,
        role=UserRole.TRAINEE,
    )

    db.add(user)

    await db.commit()
    await db.refresh(user)

    return user