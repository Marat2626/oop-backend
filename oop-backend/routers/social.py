from fastapi import APIRouter, Depends
from typing import Optional
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import Depends

from database.models import SocialLinksDB
from routers.auth import get_admin_token
from database.database import get_db

from fastapi import Request
from middleware.rate_limit import limiter, ADMIN_LIMIT, PUBLIC_LIMIT

router = APIRouter(
    tags=["Соцсети"],
)


class Social(BaseModel):
    name: str
    url: str
    icon: Optional[str] = None

class SocialUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None



@router.post("/admin/create/social", tags=["Соцсети"], summary="Добавить соцсеть", description="Требуется токен")
@limiter.limit(ADMIN_LIMIT)
def create_social(request: Request, social_link: Social, admin: str = Depends(get_admin_token), db=Depends(get_db)):


    new_social = SocialLinksDB(
        name=social_link.name,
        url=social_link.url,
        icon=social_link.icon,

    )
    try:
        db.add(new_social)
        db.commit()
        db.refresh(new_social)
        return {"id": new_social.id, "name": new_social.name, "url": new_social.url, "icon": new_social.icon}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при создании соцсети")


@router.get("/public/social", tags=["Соцсети"], summary="Получить все соцсети")
@limiter.limit(PUBLIC_LIMIT)
def get_all_socials(request: Request, db=Depends(get_db)):
    socials = db.query(SocialLinksDB).all()
    items = [{"id": s.id, "name": s.name, "url": s.url, "icon": s.icon} for s in socials]
    return {"items": items, "total": len(items)}

@router.get("/social/{social_id}", tags=["Соцсети"], summary="Получить соцсеть по ID")
@limiter.limit(PUBLIC_LIMIT)
def get_social(request: Request, social_id: int, db=Depends(get_db)):
    social = db.query(SocialLinksDB).get(social_id)
    if social is None:
        raise HTTPException(status_code=404, detail="Соцсеть не найдена")
    return {"id": social.id, "name": social.name, "url": social.url, "icon": social.icon}
@router.patch("/admin/social/update/{social_id}", tags=["Соцсети"], summary="Обновить соцсеть", description="Требуется токен")
@limiter.limit(ADMIN_LIMIT)
def update_social( request: Request, update_social: SocialUpdate, social_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):

    social = db.query(SocialLinksDB).get(social_id)
    if social is None:
        raise HTTPException(status_code=404, detail="Соцсеть не найдена")
    if update_social.name is not None:
        social.name = update_social.name
    if update_social.url is not None:
        social.url = update_social.url
    # model_fields_set: пустая строка на PATCH очищает иконку
    if "icon" in update_social.model_fields_set:
        social.icon = update_social.icon or None

    try:
        db.commit()
        db.refresh(social)
        return {"id": social.id, "name": social.name, "url": social.url, "icon": social.icon}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при обновлении соцсети")

@router.delete("/admin/social/delete/{social_id}", tags=["Соцсети"], summary="Удалить соцсеть", description="Требуется токен")
@limiter.limit(ADMIN_LIMIT)
def delete_social(request: Request, social_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    social = db.query(SocialLinksDB).get(social_id)
    if social is None:
        raise HTTPException(status_code=404, detail="Соцсеть не найдена")
    try:
        db.delete(social)
        db.commit()
        return {"message": "Удалено"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при удалении соцсети")