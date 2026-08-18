import subprocess
import os
from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from routers.auth import router as auth_router
from routers.experts import router as experts_router
from routers.social import router as social_router
from routers.webinars import router as webinar_router
from routers.rubric import router as rubric_router
from routers.site_content import router as site_content_router
from middleware.error_handler import ExceptionHandlerMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from middleware.rate_limit import limiter


os.makedirs("uploads", exist_ok=True)

# Устанавливаем лимит тела запроса (2 МБ)
app = FastAPI(
    title="Открытое образовательное пространство",
    max_request_body_size=2 * 1024 * 1024  # 2 MB
)

@app.on_event("startup")
def startup_event():
    """Запуск миграций при старте сервера"""
    try:
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print(" Миграции успешно применены")
    except subprocess.CalledProcessError as e:
        print(f" Ошибка при применении миграций: {e}")


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(ExceptionHandlerMiddleware)

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(experts_router)
app.include_router(social_router)
app.include_router(webinar_router)
app.include_router(rubric_router)
app.include_router(site_content_router)

# Раздача статики
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


if "*" in ALLOWED_ORIGINS and os.getenv("ENV") == "production":
    raise ValueError("CORS_ORIGINS не должен содержать '*' в продакшене")

@app.get("/health", tags=["Health"])
def health_check():
    """Health-check для Kubernetes/Docker"""
    return {"status": "ok"}


@app.on_event("shutdown")
def shutdown_event():
    """Закрываем соединения с БД при остановке сервера"""
    from database.database import engine
    engine.dispose()
