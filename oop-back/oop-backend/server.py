
from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from database.database import engine, Base, SessionLocal

from routers.auth import router as auth_router
from routers.experts import router as experts_router
from routers.social import router as social_router
from routers.webinars import router as webinar_router
from routers.rubric import router as rubric_router
from routers.site_content import router as site_content_router

from alembic.config import Config
from alembic import command

app = FastAPI(title = "Мои задачи")

alembic_cfg = Config("alembic.ini")
command.upgrade(alembic_cfg, "head")


app.include_router(auth_router)
app.include_router(experts_router)
app.include_router(social_router)
app.include_router(webinar_router)
app.include_router(rubric_router)
app.include_router(site_content_router)

Base.metadata.create_all(bind=engine)





app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

