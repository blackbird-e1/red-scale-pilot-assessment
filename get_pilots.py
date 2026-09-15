import asyncio

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == "trainee")
        )

        users = result.scalars().all()

        for user in users:
            print(
                f"{user.id} | {user.name} | "
                f"{user.email} | {user.role}"
            )


asyncio.run(main())