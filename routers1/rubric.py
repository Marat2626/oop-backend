from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from pydantic import BaseModel

from database.database import get_db
from database.models import RubricsDB, WebinarRubricDB
from routers.auth import get_admin_token

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
def create_rubric(rubric: Rubric, admin: str = Depends(get_admin_token),  db = Depends(get_db)):

    new_rubric = RubricsDB(
        name = rubric.name
    )

    db.add(new_rubric)
    db.commit()
    db.refresh(new_rubric)
    return new_rubric


@router.get("/public/rubrics", summary="Список рубрик")
def get_all_rubrics(db=Depends(get_db)):
    rubrics = db.query(RubricsDB).all()
    return {"items": rubrics, "total": len(rubrics)}


@router.get("/rubrics/{rubric_id}", summary="Получить рубрику по ID")
def get_rubric(rubric_id: int, db=Depends(get_db)):
    rubric = db.query(RubricsDB).get(rubric_id)
    if rubric is None:
        raise HTTPException(status_code=404, detail="Рубрика не найдена")
    return rubric


@router.patch("/admin/rubrics/update/{rubric_id}",
    summary="Обновить рубрику",
    description="Требуется токен"
)
def update_rubric(data: RubricUpdate, rubric_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    rubric = db.query(RubricsDB).get(rubric_id)
    if rubric is None:
        raise HTTPException(status_code=404, detail="Рубрика не найдена")
    if data.name is not None:
        rubric.name = data.name
    db.commit()
    db.refresh(rubric)
    return rubric


@router.delete("/admin/rubrics/delete/{rubric_id}",
    summary="Удалить рубрику",
    description="Требуется токен"
)
def delete_rubric(rubric_id: int, admin: str = Depends(get_admin_token), db=Depends(get_db)):
    rubric = db.query(RubricsDB).get(rubric_id)
    if rubric is None:
        raise HTTPException(status_code=404, detail="Рубрика не найдена")

    db.query(WebinarRubricDB).filter(WebinarRubricDB.rubric_id == rubric_id).delete()
    db.delete(rubric)
    db.commit()
    return {"message": "Рубрика удалена"}
