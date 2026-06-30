from fastapi_users import schemas
<<<<<<< HEAD

class UserRead(schemas.BaseUser[int]):
    username: str
    role: str | None = "user"

class UserCreate(schemas.BaseUserCreate):
    username: str
    role: str | None = "user"

class UserUpdate(schemas.BaseUserUpdate):
    username: str | None = None
    role: str | None = None
=======
from pydantic import EmailStr

class UserRead(schemas.BaseUser[int]):
    username: str

class UserCreate(schemas.BaseUserCreate):
    username: str
    
    # 添加兼容方法
    def create_update_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "is_active": True,
            "is_superuser": False,
            "is_verified": False,
        }

class UserUpdate(schemas.BaseUserUpdate):
    username: str | None = None
>>>>>>> origin_main
