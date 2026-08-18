from typing import TypedDict


class AuthenticatedUser(TypedDict):
    username: str
    role: str


USERS: dict[str, dict[str, str]] = {
    "trainer": {
        "password": "trainer123",
        "role": "trainer",
    },
    "trainee": {
        "password": "trainee123",
        "role": "trainee",
    },
}


def authenticate_user(
    username: str,
    password: str,
) -> AuthenticatedUser | None:
    user = USERS.get(username)

    if user is None:
        return None

    if user["password"] != password:
        return None

    return {
        "username": username,
        "role": user["role"],
    }