from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

# Создаём лимитер
limiter = Limiter(key_func=get_remote_address)

# Настройка лимитов
DEFAULT_LIMIT = "100/minute"  # 100 запросов в минуту
PUBLIC_LIMIT = "200/minute"   # 200 для публичных эндпоинтов
ADMIN_LIMIT = "30/minute"     # 30 для админки
UPLOAD_LIMIT = "10/minute"