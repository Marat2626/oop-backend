from sqlalchemy import ForeignKey, JSON, UniqueConstraint
from sqlalchemy import Integer, Column, String, DateTime, Boolean, Text
from database.database import Base


class ExpertDB(Base):
    __tablename__ = "experts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    photo = Column(String, default=None)
    organization = Column(String, default=None)
    position = Column(String, default=None)
    specialization = Column(String, default=None)
    short_info = Column(String, default=None)  # краткая информация для блока ближайшего вебинара
    webinar_ids = Column(String, default=None)

class SocialLinksDB(Base):
    __tablename__ = "social_links"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, default=None)
    icon = Column(String, default=None)


class WebinarDB(Base):
    __tablename__ = "webinars"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    duration = Column(String, nullable=True)
    talk_points = Column(Text, nullable=True)
    video_links = Column(Text, nullable=True)
    expert_id = Column(Integer, ForeignKey("experts.id"), nullable=True, index=True)
    question_url = Column(String, default=None)
    stream_url = Column(String, default=None)
    preview = Column(String, default=None)
    photo = Column(String, default=None)
    is_published = Column(Boolean, default=False, index=True)

class RubricsDB(Base):
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable= False)

class WebinarRubricDB(Base):
    __tablename__ = "webinar_rubrics"
    id = Column(Integer, primary_key=True, index=True)
    webinar_id = Column(Integer, ForeignKey("webinars.id"), nullable=False, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), nullable=False, index=True)
    __table_args__ = (
        UniqueConstraint('webinar_id', 'rubric_id', name='uq_webinar_rubric'),
    )

class SiteContentDB(Base):
    __tablename__ = "site_content"
    id = Column(Integer, primary_key=True)  # singleton id=1
    data = Column(JSON, nullable=False)
    updated_at = Column(DateTime, nullable=True)