import logging
import sys

# Настройка форматирования
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Настройка корневого логгера
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt=LOG_DATE_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),  # Вывод в консоль
    ]
)

# Создаём логгер для приложения
logger = logging.getLogger("oop_backend")