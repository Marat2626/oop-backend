from datetime import datetime
import json
from fastapi import HTTPException, Query
from typing import Optional, List

from fastapi import APIRouter
from database.models import WebinarDB, WebinarRubricDB, RubricsDB, ExpertDB
from pydantic import BaseModel, field_validator
from fastapi import Depends
from routers.auth import get_admin_token
from database.database import get_db

router = APIRouter(
    tags=["Вебинары"],
)


class VideoLink(BaseModel):
    label: str
    url: str


class Webinar(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[str] = None
    talk_points: List[str] = []
    video_links: List[VideoLink] = []
    expert_id: Optional[int] = None
    rubric_ids: list[int] = []
    stream_url: Optional[str] = None
    question_url: Optional[str] = None
    preview: Optional[str] = None
    photo: Optional[str] = None
    is_published: bool

    @field_validator("video_links")
    @classmethod
    def limit_video_links(cls, value: List[VideoLink]) -> List[VideoLink]:
        if len(value) > 4:
            raise ValueError("Максимум 4 ссылки на просмотр")
        return value


class UpdateWebinar(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[str] = None
    talk_points: Optional[List[str]] = None
    video_links: Optional[List[VideoLink]] = None
    expert_id: Optional[int] = None
    rubric_ids: Optional[list[int]] = None
    stream_url: Optional[str] = None
    question_url: Optional[str] = None
    preview: Optional[str] = None
    photo: Optional[str] = None
    is_published: Optional[bool] = None

    @field_validator("video_links")
    @classmethod
    def limit_video_links(cls, value: Optional[List[VideoLink]]) -> Optional[List[VideoLink]]:
        if value is not None and len(value) > 4:
            raise ValueError("Максимум 4 ссылки на просмотр")
        return value


def _dumps_list(value) -> Optional[str]:
    if value is None:
        return None
    items = value
    if items and hasattr(items[0], "model_dump"):
        items = [item.model_dump() for item in items]
    return json.dumps(items, ensure_ascii=False)


def _loads_list(raw: Optional[str], default=None):
    if not raw:
        return default if default is not None else []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else (default if default is not None else [])
    except (TypeError, json.JSONDecodeError):
        return default if default is not None else []


def _serialize_expert(expert: ExpertDB) -> dict:
    return {
        "id": expert.id,
        "name": expert.name,
        "photo": expert.photo,
        "position": expert.position,
        "organization": expert.organization,
        "specialization": expert.specialization,
        "short_info": expert.short_info,
    }


def _parse_expert_webinar_ids(raw: Optional[str]) -> set[str]:
    if not raw:
        return set()
    normalized = raw.replace(";", ",")
    return {part.strip() for part in normalized.split(",") if part.strip()}


def get_webinar_expert(db, webinar: WebinarDB) -> Optional[dict]:
    if webinar.expert_id:
        expert = db.query(ExpertDB).get(webinar.expert_id)
        if expert is not None:
            return _serialize_expert(expert)

    # fallback: старая связь через webinar_ids у эксперта
    target = str(webinar.id)
    experts = db.query(ExpertDB).all()
    for expert in experts:
        if target in _parse_expert_webinar_ids(expert.webinar_ids):
            return _serialize_expert(expert)
    return None


def resolve_expert_id(db, expert_id: Optional[int]) -> Optional[int]:
    if expert_id is None:
        return None
    expert = db.query(ExpertDB).get(expert_id)
    if expert is None:
        raise HTTPException(status_code=400, detail="Эксперт не найден")
    return expert.id


def serialize_webinar(webinar: WebinarDB, db) -> dict:
    links = (
        db.query(WebinarRubricDB)
        .filter(WebinarRubricDB.webinar_id == webinar.id)
        .all()
    )
    rubric_ids = [link.rubric_id for link in links]
    rubrics = []
    if rubric_ids:
        rows = db.query(RubricsDB).filter(RubricsDB.id.in_(rubric_ids)).all()
        rubrics = [{"id": row.id, "name": row.name} for row in rows]

    talk_points = _loads_list(webinar.talk_points)
    video_links = _loads_list(webinar.video_links)
    expert = get_webinar_expert(db, webinar)

    return {
        "id": webinar.id,
        "title": webinar.title,
        "description": webinar.description,
        "start_time": webinar.start_time,
        "end_time": webinar.end_time,
        "duration": webinar.duration,
        "talk_points": talk_points,
        "video_links": video_links,
        "expert_id": webinar.expert_id,
        "stream_url": webinar.stream_url,
        "question_url": webinar.question_url,
        "preview": webinar.preview,
        "photo": webinar.photo,
        "is_published": webinar.is_published,
        "rubric_ids": rubric_ids,
        "rubrics": rubrics,
        "expert": expert,
    }


@router.post(
    "/admin/create/webinar",
    summary="Создать вебинар",
    description="Требуется токен администратора в заголовке 'token'"
)
def create_webinar(webinar: Webinar, admin: str = Depends(get_admin_token), db = Depends(get_db)):

    new_webinar = WebinarDB(
        title=webinar.title,
        description=webinar.description,
        start_time=webinar.start_time,
        end_time=webinar.end_time,
        duration=webinar.duration,
        talk_points=_dumps_list(webinar.talk_points),
        video_links=_dumps_list(webinar.video_links),
        expert_id=resolve_expert_id(db, webinar.expert_id),
        stream_url=webinar.stream_url,
        question_url=webinar.question_url,
        preview=webinar.preview,
        is_published=webinar.is_published,
        photo=webinar.photo
    )
    db.add(new_webinar)
    db.commit()
    db.refresh(new_webinar)

    for rubric_id in webinar.rubric_ids:
        link = WebinarRubricDB(webinar_id=new_webinar.id, rubric_id=rubric_id)
        db.add(link)
    db.commit()
    db.refresh(new_webinar)
    return serialize_webinar(new_webinar, db)


@router.get(
    path="/admin/webinar/all",
    summary= "Просмотр вебинара",
)
def get_all_webinar( db = Depends(get_db)):
    webinars = db.query(WebinarDB).all()
    items = [serialize_webinar(item, db) for item in webinars]
    return {"items": items, "total": len(items)}

@router.get(
    path="/admin/webinar/{webinar_id}",
    summary="Просмотр вебинара по id",
)
def get_webinar(webinar_id: int, db = Depends(get_db)):
    webinar = db.query(WebinarDB).get(webinar_id)
    if webinar is None:
        raise HTTPException(status_code=404, detail="Вебинар не найден")
    return serialize_webinar(webinar, db)

@router.patch(
    path="/admin/webinar/update/{webinar_id}",
    summary="Обновление вебинара по id",
    description="Требуется токен администратора в заголовке 'token'"
)
def update_webinar(updateWebinar: UpdateWebinar, webinar_id: int, admin: str = Depends(get_admin_token), db = Depends(get_db)):

    webinar = db.query(WebinarDB).get(webinar_id)

    if webinar is None:
        raise HTTPException(status_code=404, detail="Вебинар не найден")

    if updateWebinar.title is not None:
        webinar.title = updateWebinar.title

    if updateWebinar.description is not None:
        webinar.description = updateWebinar.description

    if updateWebinar.start_time is not None:
        webinar.start_time = updateWebinar.start_time

    if updateWebinar.rubric_ids is not None:
        db.query(WebinarRubricDB).filter(WebinarRubricDB.webinar_id == webinar.id).delete()
        for rubric_id in updateWebinar.rubric_ids:
            db.add(WebinarRubricDB(webinar_id=webinar.id, rubric_id=rubric_id))

    # model_fields_set: пустое/null на PATCH очищает поле (не «залипает» старое значение)
    if "question_url" in updateWebinar.model_fields_set:
        webinar.question_url = updateWebinar.question_url

    if "end_time" in updateWebinar.model_fields_set:
        webinar.end_time = updateWebinar.end_time

    if "duration" in updateWebinar.model_fields_set:
        webinar.duration = updateWebinar.duration

    if updateWebinar.talk_points is not None:
        webinar.talk_points = _dumps_list(updateWebinar.talk_points)

    if updateWebinar.video_links is not None:
        webinar.video_links = _dumps_list(updateWebinar.video_links)

    if "expert_id" in updateWebinar.model_fields_set:
        webinar.expert_id = resolve_expert_id(db, updateWebinar.expert_id)

    if "stream_url" in updateWebinar.model_fields_set:
        webinar.stream_url = updateWebinar.stream_url

    if updateWebinar.is_published is not None:
        webinar.is_published = updateWebinar.is_published

    if "photo" in updateWebinar.model_fields_set:
        webinar.photo = updateWebinar.photo

    if "preview" in updateWebinar.model_fields_set:
        webinar.preview = updateWebinar.preview

    db.commit()
    db.refresh(webinar)
    return serialize_webinar(webinar, db)

@router.delete(
    path="/admin/webinar/delete/{webinar_id}",
    summary="Удаление вебинара по id",
    description="Требуется токен администратора в заголовке 'token'"
)
def delete_webinar(webinar_id: int, admin: str = Depends(get_admin_token), db = Depends(get_db)):

    webinar = db.query(WebinarDB).get(webinar_id)

    if webinar is None:
        raise HTTPException(status_code=404, detail="Вебинар не найден")

    db.query(WebinarRubricDB).filter(WebinarRubricDB.webinar_id == webinar_id).delete()
    db.delete(webinar)
    db.commit()
    return {"message": "Вебинар удален"}



@router.get("/public/next-webinar", summary="Ближайший вебинар")
def get_next_webinar(db=Depends(get_db)):
    webinar = (
        db.query(WebinarDB)
        .filter(WebinarDB.is_published == True, WebinarDB.start_time >= datetime.now())
        .order_by(WebinarDB.start_time)
        .first()
    )
    if webinar is None:
        return None
    return serialize_webinar(webinar, db)


@router.get("/public/webinars", summary="Вебинары с фильтрацией и поиском")
def get_webinars(
    rubric_id: int = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db = Depends(get_db)
):
    query = db.query(WebinarDB).filter(WebinarDB.is_published == True)

    if rubric_id:
        ids = db.query(WebinarRubricDB.webinar_id).filter(WebinarRubricDB.rubric_id == rubric_id).all()
        webinar_ids = [i[0] for i in ids]
        query = query.filter(WebinarDB.id.in_(webinar_ids))

    if search:
        query = query.filter(
            WebinarDB.title.ilike(f"%{search}%") |
            WebinarDB.description.ilike(f"%{search}%")
        )

    total = query.count()
    webinars = query.order_by(WebinarDB.start_time).offset((page - 1) * limit).limit(limit).all()

    return {
        "items": [serialize_webinar(item, db) for item in webinars],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/public/videos", summary="Архив прошедших")
def get_past_webinars(db=Depends(get_db)):
    webinars = (
        db.query(WebinarDB)
        .filter(WebinarDB.is_published == True, WebinarDB.start_time < datetime.now())
        .order_by(WebinarDB.start_time.desc())
        .all()
    )
    items = [serialize_webinar(item, db) for item in webinars]
    return {"items": items, "total": len(items)}
