import logging
from fastapi import APIRouter
from typing import Optional, List
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import Depends
from database.models import ExpertDB, WebinarDB
from routers.auth import get_admin_token
from database.database import get_db

from fastapi import Request
from middleware.rate_limit import limiter, ADMIN_LIMIT, PUBLIC_LIMIT

logger = logging.getLogger(__name__)

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
    name: Optional[str] = None
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


@router.post(
    "/admin/create/expert",
    summary="Создать эксперта",
    description="Требуется токен администратора в заголовке 'token'"
)
@limiter.limit(ADMIN_LIMIT)
def create_expert(
    request: Request,
    expert: Expert,
    admin: str = Depends(get_admin_token),
    db=Depends(get_db)
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

    try:
        db.add(newExpert)
        db.commit()
        db.refresh(newExpert)
        return serialize_expert(newExpert, db)
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании эксперта: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")


@router.get("/admin/expert/all", tags=["Эксперты"], summary="Список экспертов")
@limiter.limit(PUBLIC_LIMIT)
def get_all_experts(
    request: Request,
        db=Depends(get_db)):
    experts = db.query(ExpertDB).all()
    items = [serialize_expert(item, db) for item in experts]
    return {"items": items, "total": len(items)}


@router.get("/admin/expert/{expert_id}", tags=["Эксперты"], summary="Получить эксперта")
@limiter.limit(PUBLIC_LIMIT)
def get_expert(
        request: Request,
        expert_id: int, db=Depends(get_db)):
    expert = db.query(ExpertDB).get(expert_id)
    if expert is None:
        raise HTTPException(status_code=404, detail="Эксперт не найден")
    return serialize_expert(expert, db)


@router.delete(
    "/admin/expert/delete/{expert_id}",
    tags=["Эксперты"],
    summary="Удалить эксперта",
    description="Требуется токен"
)
@limiter.limit(ADMIN_LIMIT)
def delete_expert(
        request: Request,
        expert_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    expert = db.query(ExpertDB).get(expert_id)
    if expert is None:
        raise HTTPException(status_code=404, detail="Эксперт не найден")
    try:
        db.delete(expert)
        db.commit()
        return {"message": "Эксперт удален"}
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при удалении эксперта: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Ошибка при удалении эксперта")


@router.patch(
    "/admin/expert/update/{expert_id}",
    tags=["Эксперты"],
    summary="Обновить эксперта",
    description="Требуется токен"
)
@limiter.limit(ADMIN_LIMIT)
def update_expert(
request: Request,
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

    try:
        db.commit()
        db.refresh(expert)
        return serialize_expert(expert, db)
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении эксперта: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Ошибка при обновлении эксперта")