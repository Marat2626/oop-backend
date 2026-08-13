from fastapi import APIRouter, Depends
from typing import Optional
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import Depends

from database.models import SocialLinksDB
from routers.auth import get_admin_token
from database.database import get_db

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
def create_social(social_link: Social, admin: str = Depends(get_admin_token), db=Depends(get_db)):


    new_social = SocialLinksDB(
        name=social_link.name,
        url=social_link.url,
        icon=social_link.icon,

    )
    db.add(new_social)
    db.commit()
    db.refresh(new_social)
    return new_social


@router.get("/public/social", tags=["Соцсети"], summary="Получить все соцсети")
def get_all_socials(db=Depends(get_db)):
    socials = db.query(SocialLinksDB).all()
    return {"items": socials, "total": len(socials)}


@router.get("/social/{social_id}", tags=["Соцсети"], summary="Получить соцсеть по ID")
def get_social(social_id: int, db=Depends(get_db)):
    social = db.query(SocialLinksDB).get(social_id)
    if social is None:
        raise HTTPException(status_code=404, detail="Соцсеть не найдена")
    return social

@router.patch("/admin/social/update/{social_id}", tags=["Соцсети"], summary="Обновить соцсеть", description="Требуется токен")
def update_social(update_social: SocialUpdate, social_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):

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

    db.commit()
    db.refresh(social)
    return social

@router.delete("/admin/social/delete/{social_id}", tags=["Соцсети"], summary="Удалить соцсеть", description="Требуется токен")
def delete_social(social_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    social = db.query(SocialLinksDB).get(social_id)
    if social is None:
        raise HTTPException(status_code=404, detail="Соцсеть не найдена")
    db.delete(social)
    db.commit()
    return {"message": "Удалено"}