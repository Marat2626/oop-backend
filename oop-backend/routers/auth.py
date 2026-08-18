import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Header, HTTPException, Depends, UploadFile, File
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

from fastapi import Request
from middleware.rate_limit import limiter, ADMIN_LIMIT, PUBLIC_LIMIT, UPLOAD_LIMIT

router = APIRouter(
    tags=["Авторизация и загрузка фото"],
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY не установлена в .env")


ADMIN_LOGIN = os.getenv("ADMIN_LOGIN")
if not ADMIN_LOGIN:
    raise RuntimeError("ADMIN_LOGIN не установлена в .env")


ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD не установлена в .env")

def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data = {
        "sub": username,
        "exp": expire
    }

    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return token


def get_admin_token(token: str = Header(None)):
    if token is None:
        raise HTTPException(status_code=403, detail="Нет токена в заголовке")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=403, detail="Токен неверный или просрочен")



class User(BaseModel):
    username: str
    password: str

@router.get("/")
@limiter.limit(PUBLIC_LIMIT)
def start(request: Request, ):
    return "Добрый День вы зашли"

@router.post("/admin/user")
@limiter.limit(ADMIN_LIMIT)
def user(request: Request, data: User):
    if data.username == ADMIN_LOGIN and data.password == ADMIN_PASSWORD:
        token = create_access_token(data.username)
        return {"token": token}
    return {"error": "Неверный логин или пароль"}

import os
from pathlib import Path

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ

@router.post("/admin/images/upload", tags=["Файлы"], summary="Загрузить фото", description="Требуется токен")
@limiter.limit(UPLOAD_LIMIT)
async def upload_photo(request: Request, file: UploadFile = File(...), admin: str = Depends(get_admin_token)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "gif", "webp", "svg"):
        raise HTTPException(400, "Только jpg, png, gif, webp, svg")

    allowed_content_types = ("image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml")
    if file.content_type not in allowed_content_types:
        raise HTTPException(400, "Неверный тип файла")

    content = b""
    while chunk := await file.read(1024 * 1024):  # читаем по 1 МБ
        content += chunk
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(400, "Файл слишком большой (максимум 10 МБ)")

    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/{filename}"}
