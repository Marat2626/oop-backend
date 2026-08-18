import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Переменная окружения DATABASE_URL не установлена")

# Настройка пула соединений для продакшена
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # Проверка соединения перед использованием
    pool_size=10,              # Максимум постоянных соединений в пуле
    max_overflow=20,           # Дополнительные соединения при пиковой нагрузке
    pool_recycle=3600,         # Пересоздавать соединения через 1 час (предотвращает разрывы)
    pool_timeout=30,           # Таймаут ожидания соединения из пула (секунды)
    echo=False,                # Не логировать SQL (для продакшена)
)

Base = declarative_base()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()