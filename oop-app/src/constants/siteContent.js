export const DEFAULT_SITE_CONTENT = {
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

export function mergeSiteContent(raw) {
  const base = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
  if (!raw || typeof raw !== "object") return base;
  return {
    brand: { ...base.brand, ...(raw.brand || {}) },
    nav: { ...base.nav, ...(raw.nav || {}) },
    home_hero: { ...base.home_hero, ...(raw.home_hero || {}) },
    home_webinar: {
      ...base.home_webinar,
      ...(raw.home_webinar || {}),
      featured_past_webinar_id:
        raw.home_webinar?.featured_past_webinar_id ??
        base.home_webinar.featured_past_webinar_id,
    },
    about: { ...base.about, ...(raw.about || {}) },
    stats: { ...base.stats, ...(raw.stats || {}) },
  };
}
