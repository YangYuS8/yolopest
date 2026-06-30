<<<<<<< HEAD
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    共享的 SQLAlchemy 声明基类。

    使用 SQLAlchemy 2.0 的 DeclarativeBase，以便与
    fastapi_users_db_sqlalchemy 14.0+ 的 SQLAlchemyBaseUserTable
    （基于 Mapped 注解的写法）兼容。
    老式的 Column 风格模型（Detection、History）同样适用。
    """
    pass
=======
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
>>>>>>> origin_main
