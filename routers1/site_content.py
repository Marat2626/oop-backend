from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import SiteContentDB
from routers.auth import get_admin_token
from schemas.site_content import DEFAULT_SITE_CONTENT, SiteContent

router = APIRouter(tags=["Контент сайта"])

SITE_CONTENT_ID = 1


def _dump(content: SiteContent) -> Dict[str, Any]:
    if hasattr(content, "model_dump"):
        return content.model_dump()
    return content.dict()


def _parse(raw: Any) -> SiteContent:
    if not isinstance(raw, dict):
        return SiteContent()
    if hasattr(SiteContent, "model_validate"):
        return SiteContent.model_validate(raw)
    return SiteContent.parse_obj(raw)


def ensure_site_content(db: Session) -> SiteContentDB:
    row = db.query(SiteContentDB).get(SITE_CONTENT_ID)
    if row is None:
        row = SiteContentDB(
            id=SITE_CONTENT_ID,
            data=_dump(DEFAULT_SITE_CONTENT),
            updated_at=datetime.utcnow(),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/public/site-content", summary="Получить контент сайта")
def get_site_content(db: Session = Depends(get_db)):
    row = ensure_site_content(db)
    return _dump(_parse(row.data))


@router.put(
    "/admin/site-content",
    summary="Обновить контент сайта",
    description="Требуется токен администратора",
)
def put_site_content(
    payload: SiteContent,
    admin: str = Depends(get_admin_token),
    db: Session = Depends(get_db),
):
    row = ensure_site_content(db)
    row.data = _dump(payload)
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _dump(_parse(row.data))
