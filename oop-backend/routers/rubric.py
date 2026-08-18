from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from pydantic import BaseModel

from database.database import get_db
from database.models import RubricsDB, WebinarRubricDB
from routers.auth import get_admin_token


from fastapi import Request
from middleware.rate_limit import limiter, ADMIN_LIMIT, PUBLIC_LIMIT

router = APIRouter(
    tags= ["Рубрики"],
)


class Rubric(BaseModel):
    name: str

class RubricUpdate(BaseModel):
    name: Optional[str] = None

@router.post("/admin/create/rubrics",
    summary="Создать рубрику",  # Короткое описание
    description="Требуется токен администратора в заголовке 'token'"
)
@limiter.limit(ADMIN_LIMIT)
def create_rubric(   request: Request, rubric: Rubric, admin: str = Depends(get_admin_token),  db = Depends(get_db)):

    new_rubric = RubricsDB(
        name = rubric.name
    )

    try:
        db.add(new_rubric)
        db.commit()
        db.refresh(new_rubric)
        return {"id": new_rubric.id, "name": new_rubric.name}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при создании рубрики")

@router.get("/public/rubrics", summary="Список рубрик")
@limiter.limit(PUBLIC_LIMIT)
def get_all_rubrics(  request: Request,db=Depends(get_db)):
    rubrics = db.query(RubricsDB).all()
    items = [{"id": r.id, "name": r.name} for r in rubrics]
    return {"items": items, "total": len(items)}

@router.get("/rubrics/{rubric_id}", summary="Получить рубрику по ID")
@limiter.limit(PUBLIC_LIMIT)
def get_rubric(request: Request,rubric_id: int, db=Depends(get_db)):
    rubric = db.query(RubricsDB).get(rubric_id)
    if rubric is None:
        raise HTTPException(status_code=404, detail="Рубрика не найдена")
    return {"id": rubric.id, "name": rubric.name}


@router.patch("/admin/rubrics/update/{rubric_id}",
    summary="Обновить рубрику",
    description="Требуется токен"
)
@limiter.limit(ADMIN_LIMIT)
def update_rubric(request: Request,data: RubricUpdate, rubric_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    rubric = db.query(RubricsDB).get(rubric_id)
    if rubric is None:
        raise HTTPException(status_code=404, detail="Рубрика не найдена")
    if data.name is not None:
        rubric.name = data.name
    try:
        db.commit()
        db.refresh(rubric)
        return {"id": rubric.id, "name": rubric.name}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при обновлении рубрики")

@router.delete("/admin/rubrics/delete/{rubric_id}",
    summary="Удалить рубрику",
    description="Требуется токен"
)
@limiter.limit(ADMIN_LIMIT)
def delete_rubric(request: Request,rubric_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    rubric = db.query(RubricsDB).get(rubric_id)
    if rubric is None:
        raise HTTPException(status_code=404, detail="Рубрика не найдена")

    try:
        db.query(WebinarRubricDB).filter(WebinarRubricDB.rubric_id == rubric_id).delete()
        db.delete(rubric)
        db.commit()
        return {"message": "Рубрика удалена"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при удалении рубрики")