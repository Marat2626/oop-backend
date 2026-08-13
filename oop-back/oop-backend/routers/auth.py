import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Header, HTTPException, Depends, UploadFile, File
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel




router = APIRouter(
    tags=["Авторизация и загрузка фото"],
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_LOGIN = os.getenv("ADMIN_LOGIN")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

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
def start():
    return "Добрый День вы зашли"

@router.post("/admin/user")
def user(data: User):
    if data.username == ADMIN_LOGIN and data.password == ADMIN_PASSWORD:
        token = create_access_token(data.username)
        return {"token": token}
    return {"error": "Неверный логин или пароль"}


UPLOAD_DIR = "uploads"
@router.post("/admin/images/upload", tags=["Файлы"], summary="Загрузить фото", description="Требуется токен")
async def upload_photo(file: UploadFile = File(...), admin: str = Depends(get_admin_token)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "gif", "webp", "svg"):
        raise HTTPException(400, "Только jpg, png, gif, webp, svg")
    filename = f"{uuid.uuid4()}.{ext}"

    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    return {"url": f"/uploads/{filename}"}


