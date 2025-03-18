from fastapi import APIRouter, Depends
from app.core.users import fastapi_users, auth_backend, current_active_user, current_superuser
from app.models.user import User
from app.schemas.user import UserRead, UserCreate, UserUpdate  # 确保导入所有必要的schema

api_router = APIRouter()

# 包含FastAPI Users提供的路由
api_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth",
    tags=["认证"],
)
api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["认证"],
)
api_router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["认证"],
)
api_router.include_router(
    fastapi_users.get_verify_router(UserRead),  # 添加UserRead参数
    prefix="/auth",
    tags=["认证"],
)
api_router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),  # 添加必要参数
    prefix="/users",
    tags=["用户"],
)

# 添加一个测试端点
@api_router.get("/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"您已登录为: {user.email}"}

# 管理员专用端点示例
@api_router.get("/admin-route")
async def admin_route(user: User = Depends(current_superuser)):
    return {"message": "您拥有管理员权限"}