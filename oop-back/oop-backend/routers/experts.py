from fastapi import APIRouter

from typing import Optional, List
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import Depends
from database.models import ExpertDB, WebinarDB
from routers.auth import get_admin_token
from database.database import get_db

router = APIRouter(
    tags=["Эксперты"],
)


class Expert(BaseModel):
    name: str
    organization: Optional[str] = None
    position: Optional[str] = None
    specialization: Optional[str] = None
    short_info: Optional[str] = None
    photo: Optional[str] = None
    webinar_ids: Optional[str] = None

class ExpertUpdate(BaseModel):
    name:  Optional[str] = None
    organization: Optional[str] = None
    position: Optional[str] = None
    specialization: Optional[str] = None
    short_info: Optional[str] = None
    photo: Optional[str] = None
    webinar_ids: Optional[str] = None


def _parse_webinar_ids(raw: Optional[str]) -> List[int]:
    if not raw:
        return []
    ids = []
    for part in raw.replace(";", ",").split(","):
        part = part.strip()
        if not part:
            continue
        try:
            ids.append(int(part))
        except ValueError:
            continue
    return ids


def get_expert_webinars(db, expert: ExpertDB):
    from routers.webinars import serialize_webinar

    by_id = {}

    linked = (
        db.query(WebinarDB)
        .filter(WebinarDB.expert_id == expert.id, WebinarDB.is_published == True)
        .all()
    )
    for webinar in linked:
        by_id[webinar.id] = webinar

    for webinar_id in _parse_webinar_ids(expert.webinar_ids):
        if webinar_id in by_id:
            continue
        webinar = db.query(WebinarDB).get(webinar_id)
        if webinar is not None and webinar.is_published:
            by_id[webinar.id] = webinar

    webinars = sorted(
        by_id.values(),
        key=lambda item: item.start_time or item.id,
        reverse=True,
    )
    return [serialize_webinar(item, db) for item in webinars]


def serialize_expert(expert: ExpertDB, db) -> dict:
    return {
        "id": expert.id,
        "name": expert.name,
        "photo": expert.photo,
        "organization": expert.organization,
        "position": expert.position,
        "specialization": expert.specialization,
        "short_info": expert.short_info,
        "webinar_ids": expert.webinar_ids,
        "webinars": get_expert_webinars(db, expert),
    }


@router.post( "/admin/create/expert",
    summary="Создать эксперта",  # Короткое описание
    description="Требуется токен администратора в заголовке 'token'"
)
def create_expert(
    expert: Expert,
    admin: str = Depends(get_admin_token),
    db = Depends(get_db)
):
    newExpert = ExpertDB(
        name=expert.name,
        organization=expert.organization,
        position=expert.position,
        specialization=expert.specialization,
        short_info=expert.short_info,
        photo=expert.photo,
        webinar_ids=expert.webinar_ids,

    )

    db.add(newExpert)
    db.commit()
    db.refresh(newExpert)
    return serialize_expert(newExpert, db)



@router.get("/admin/expert/all", tags=["Эксперты"], summary="Список экспертов")
def get_all_experts(db=Depends(get_db)):
    experts = db.query(ExpertDB).all()
    items = [serialize_expert(item, db) for item in experts]
    return {"items": items, "total": len(items)}


@router.get("/admin/expert/{expert_id}", tags=["Эксперты"], summary="Получить эксперта")
def get_expert(expert_id: int, db = Depends(get_db)):
    expert = db.query(ExpertDB).get(expert_id)
    if expert is None:
        raise HTTPException(status_code=404, detail="Эксперт не найден")
    return serialize_expert(expert, db)


@router.delete("/admin/expert/delete/{expert_id}", tags=["Эксперты"], summary="Удалить эксперта", description="Требуется токен")
def delete_expert(expert_id: int,  admin: str = Depends(get_admin_token), db = Depends(get_db)):
    expert = db.query(ExpertDB).get(expert_id)
    if expert is None:
        raise HTTPException(status_code=404, detail="Эксперт не найден")
    db.delete(expert)
    db.commit()
    return {"message": "Эксперт удален"}


@router.patch("/admin/expert/update/{expert_id}", tags=["Эксперты"], summary="Обновить эксперта", description="Требуется токен")
def update_expert(
        update: ExpertUpdate,
        expert_id: int,
        admin: str = Depends(get_admin_token),
        db=Depends(get_db)
):
    expert = db.query(ExpertDB).get(expert_id)

    if expert is None:
        raise HTTPException(status_code=404, detail="Эксперт не найден")

    if update.name is not None:
        expert.name = update.name
    # model_fields_set: пустая строка на PATCH очищает поле
    if "organization" in update.model_fields_set:
        expert.organization = update.organization
    if "position" in update.model_fields_set:
        expert.position = update.position
    if "specialization" in update.model_fields_set:
        expert.specialization = update.specialization
    if "short_info" in update.model_fields_set:
        expert.short_info = update.short_info
    if "photo" in update.model_fields_set:
        expert.photo = update.photo
    if "webinar_ids" in update.model_fields_set:
        expert.webinar_ids = update.webinar_ids

    db.commit()
    db.refresh(expert)
    return serialize_expert(expert, db)
