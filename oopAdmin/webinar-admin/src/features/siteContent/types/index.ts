export type WebinarBlockMode = "auto" | "force_next" | "force_past";
export type PastDisplayMode = "cards" | "featured_video";
export type NextMediaMode = "photo" | "stream";

export interface BrandContent {
  logo_url: string;
  logo_secondary_url: string;
  title_line1: string;
  title_line2: string;
  title_line3: string;
}

export interface NavContent {
  home: string;
  calendar: string;
  webinars: string;
  experts: string;
  about: string;
  question_cta: string;
}

export interface HomeHeroContent {
  subtitle: string;
  primary_cta: string;
  secondary_cta: string;
}

export interface HomeWebinarContent {
  next_title: string;
  next_link_label: string;
  past_title: string;
  past_link_label: string;
  mode: WebinarBlockMode;
  past_display: PastDisplayMode;
  media_mode: NextMediaMode;
  stream_url: string;
  featured_past_webinar_id: number | null;
}

export interface AboutContent {
  right_block_1: string;
  right_block_2: string;
}

export interface StatsContent {
  webinars_value: string;
  webinars_label: string;
  listeners_value: string;
  listeners_label: string;
  topics_value: string;
  topics_label: string;
}

export interface SiteContent {
  brand: BrandContent;
  nav: NavContent;
  home_hero: HomeHeroContent;
  home_webinar: HomeWebinarContent;
  about: AboutContent;
  stats: StatsContent;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    logo_url: "",
    logo_secondary_url: "",
    title_line1: "ОТКРЫТОЕ",
    title_line2: "ОБРАЗОВАТЕЛЬНОЕ",
    title_line3: "ПРОСТРАНСТВО",
  },
  nav: {
    home: "Главная",
    calendar: "Календарь событий",
    webinars: "Все выпуски",
    experts: "Наши эксперты",
    about: "О нас",
    question_cta: "Задай вопрос",
  },
  home_hero: {
    subtitle:
      "Бесплатные вебинары и интервью с ведущими экспертами. ООП — среда для саморазвития, доступная каждому.",
    primary_cta: "Смотреть записи",
    secondary_cta: "Календарь событий",
  },
  home_webinar: {
    next_title: "Ближайший вебинар",
    next_link_label: "Все мероприятия",
    past_title: "Прошедшие вебинары",
    past_link_label: "Все выпуски",
    mode: "auto",
    past_display: "cards",
    media_mode: "photo",
    stream_url: "",
    featured_past_webinar_id: null,
  },
  about: {
    right_block_1:
      "Тогда и родилась идея Открытого образовательного пространства (ООП). Пространства для развития и обмена опытом, которое будет доступно всем.",
    right_block_2:
      "Мы стали приглашать экспертов из разных областей знания, чтобы поговорить с ними в прямом эфире. Именно такой формат позволял всем желающим легко присоединиться к беседе и задать вопрос эксперту из любой точки мира.",
  },
  stats: {
    webinars_value: "600+",
    webinars_label: "вебинаров",
    listeners_value: "100 000+",
    listeners_label: "слушателей",
    topics_value: "20+",
    topics_label: "тематик",
  },
};
