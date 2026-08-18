from typing import Literal, Optional

from pydantic import BaseModel, Field


class BrandContent(BaseModel):
    logo_url: str = ""
    logo_secondary_url: str = ""
    title_line1: str = "ОТКРЫТОЕ"
    title_line2: str = "ОБРАЗОВАТЕЛЬНОЕ"
    title_line3: str = "ПРОСТРАНСТВО"


class NavContent(BaseModel):
    home: str = "Главная"
    calendar: str = "Календарь событий"
    webinars: str = "Все выпуски"
    experts: str = "Наши эксперты"
    about: str = "О нас"
    question_cta: str = "Задай вопрос"


class HomeHeroContent(BaseModel):
    subtitle: str = (
        "Бесплатные вебинары и интервью с ведущими экспертами. "
        "ООП — среда для саморазвития, доступная каждому."
    )
    primary_cta: str = "Смотреть записи"
    secondary_cta: str = "Календарь событий"


class HomeWebinarContent(BaseModel):
    next_title: str = "Ближайший вебинар"
    next_link_label: str = "Все мероприятия"
    past_title: str = "Прошедшие вебинары"
    past_link_label: str = "Все выпуски"
    mode: Literal["auto", "force_next", "force_past"] = "auto"
    past_display: Literal["cards", "featured_video"] = "cards"
    media_mode: Literal["photo", "stream"] = "photo"
    stream_url: str = ""
    featured_past_webinar_id: Optional[int] = None


class AboutContent(BaseModel):
    right_block_1: str = (
        "Тогда и родилась идея Открытого образовательного пространства (ООП). "
        "Пространства для развития и обмена опытом, которое будет доступно всем."
    )
    right_block_2: str = (
        "Мы стали приглашать экспертов из разных областей знания, чтобы поговорить "
        "с ними в прямом эфире. Именно такой формат позволял всем желающим легко "
        "присоединиться к беседе и задать вопрос эксперту из любой точки мира."
    )


class StatsContent(BaseModel):
    webinars_value: str = "600+"
    webinars_label: str = "вебинаров"
    listeners_value: str = "100 000+"
    listeners_label: str = "слушателей"
    topics_value: str = "20+"
    topics_label: str = "тематик"


class SiteContent(BaseModel):
    brand: BrandContent = Field(default_factory=BrandContent)
    nav: NavContent = Field(default_factory=NavContent)
    home_hero: HomeHeroContent = Field(default_factory=HomeHeroContent)
    home_webinar: HomeWebinarContent = Field(default_factory=HomeWebinarContent)
    about: AboutContent = Field(default_factory=AboutContent)
    stats: StatsContent = Field(default_factory=StatsContent)


DEFAULT_SITE_CONTENT = SiteContent()
