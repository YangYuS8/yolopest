from typing import Optional, Union, AsyncGenerator
from fastapi import Depends, Request
from fastapi_users import FastAPIUsers, BaseUserManager, IntegerIDMixin, schemas
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users.exceptions import InvalidPasswordException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.database import get_db
from app.core.config import get_settings

settings = get_settings()

# 获取用户数据库
async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)

# 用户管理器
class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = settings.secret_key
    verification_token_secret = settings.secret_key

    async def validate_password(
        self, password: str, user: Union[User, None] = None
    ) -> None:
        if len(password) < 8:
            raise InvalidPasswordException(
                reason="密码长度必须至少为8个字符"
            )
        if user and user.email in password:
            raise InvalidPasswordException(
                reason="密码不能包含电子邮件"
            )

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"用户 {user.email} 已注册")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"用户 {user.email} 忘记了密码。重置令牌: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"验证 {user.email} 的请求。验证令牌: {token}")

    # 直接使用 BaseUserCreate 和 User
    async def create(
        self,
        user_create: schemas.BaseUserCreate,  # 或 UserCreate
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        """
        创建用户并持久化到数据库中。
        
        这是为了兼容旧版本的 fastapi-users 或修复 create_update_dict 缺失问题
        """
        await self.validate_password(user_create.password, user_create)

        # 使用直接访问属性替代 create_update_dict
        user_dict = {
            "email": user_create.email,
            "hashed_password": self.password_helper.hash(user_create.password),
            "is_active": True,
            "is_superuser": False,
            "is_verified": False,
        }
        
        # 添加其他字段
        if hasattr(user_create, "username"):
            user_dict["username"] = user_create.username

        created_user = await self.user_db.create(user_dict)
        
        await self.on_after_register(created_user, request)
        
        return created_user

# 获取用户管理器
async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

# 配置令牌传输 - 注意URL前缀
bearer_transport = BearerTransport(tokenUrl="/api/auth/login")

# 配置JWT策略
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.secret_key, 
        lifetime_seconds=settings.access_token_expire_minutes * 60
    )

# 创建认证后端
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# 创建FastAPI Users实例
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

# 依赖项：获取当前用户
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)