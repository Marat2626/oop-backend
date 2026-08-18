import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Логируем ошибку с полным стеком
            logger.error(f"Unhandled exception: {e}", exc_info=True)

            # Возвращаем понятный ответ (фронт получит 500)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "Внутренняя ошибка сервера. Мы уже работаем над исправлением."
                }
            )