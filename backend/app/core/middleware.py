from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import traceback

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except HTTPException as e:
            # 正常的HTTP异常，直接向客户端返回
            logger.warning(f"HTTP异常: {e.status_code} - {e.detail}")
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail}
            )
        except Exception as e:
            # 未处理的异常，返回500错误
            error_detail = str(e)
            logger.error(f"未处理的异常: {error_detail}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={"detail": f"服务器内部错误: {error_detail}"}
            )