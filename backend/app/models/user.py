from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from sqlalchemy import Column, Integer, String, Boolean, DateTime
<<<<<<< HEAD
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base  # 导入共享的Base


class User(SQLAlchemyBaseUserTable[int], Base):
    """
    用户模型
    注意：email、hashed_password、is_active、is_superuser、is_verified
    已经由 SQLAlchemyBaseUserTable 提供，不要重复定义
    主键 id 也要自己声明（int 类型时 SQLAlchemyBaseUserTable 不提供）
    """
    __tablename__ = "users"

    # 显式声明 int 主键（SQLAlchemyBaseUserTable[int] 不自带 id）
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # 只添加自定义字段
    username = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, default="user")  # 可以是 'user' 或 'admin'

    # 检测结果关联
    detections = relationship("Detection", back_populates="user", cascade="all, delete-orphan")
    history = relationship("History", back_populates="user", cascade="all, delete-orphan")
=======
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base  # 导入共享的Base

class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True, index=True)
    username = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, default="user")  # 可以是 'user' 或 'admin'
    
    # 检测结果关联
    detections = relationship("Detection", back_populates="user", cascade="all, delete")
    history = relationship("History", back_populates="user", cascade="all, delete")
>>>>>>> origin_main
