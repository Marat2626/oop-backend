import { asset } from "./asset.js";
import { mediaUrl, normalizeUrl } from "./mediaUrl.js";

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return "";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const ms = end.getTime() - start.getTime();

  if (!Number.isFinite(ms) || ms <= 0) return "";

  const totalSec = Math.round(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatTag(webinar) {
  if (webinar.rubric_name) return `#${webinar.rubric_name}`;
  if (Array.isArray(webinar.rubrics) && webinar.rubrics.length > 0) {
    const name = webinar.rubrics[0]?.name || webinar.rubrics[0];
    return name ? `#${name}` : "";
  }
  if (webinar.category) {
    return webinar.category.startsWith("#")
      ? webinar.category
      : `#${webinar.category}`;
  }
  return "";
}

function resolveImage(path, fallback = "/image.jpg") {
  const hasRealImage =
    typeof path === "string" &&
    (path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("/uploads") ||
      path.startsWith("uploads/"));

  return hasRealImage ? mediaUrl(path) : asset(fallback);
}

function formatWebinarDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const formatted = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  });
  return /г\.?\s*$/.test(formatted) ? formatted : `${formatted} г.`;
}

function formatWebinarTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Moscow",
  });
  return `${time} МСК`;
}

function formatTitle(title) {
  const value = (title || "").trim();
  if (!value) return "";
  if (value.startsWith("«") || value.startsWith('"')) return value;
  return `«${value}»`;
}

function mapTalkPoints(webinar) {
  if (Array.isArray(webinar.talk_points) && webinar.talk_points.length > 0) {
    return webinar.talk_points.map((item) => String(item).trim()).filter(Boolean);
  }

  const description = (webinar.description || "").trim();
  if (!description) return [];

  return description
    .split(/\r?\n|•|;/)
    .map((line) => line.replace(/^[-–•*]\s*/, "").trim())
    .filter(Boolean);
}

function mapVideoLinks(webinar) {
  if (Array.isArray(webinar.video_links) && webinar.video_links.length > 0) {
    return webinar.video_links
      .map((link) => ({
        label: (link?.label || "").trim(),
        url: normalizeUrl(link?.url || ""),
      }))
      .filter((link) => link.label && link.url)
      .slice(0, 4);
  }

  const stream = normalizeUrl(webinar.stream_url || "");
  return stream ? [{ label: "Рутуб", url: stream }] : [];
}

function mapExpert(expert) {
  if (!expert) return null;
  return {
    id: expert.id,
    name: expert.name || "",
    photo: expert.photo ? mediaUrl(expert.photo) : "",
    position: expert.position || "",
    organization: expert.organization || "",
    specialization: expert.specialization || "",
    shortInfo: expert.short_info || "",
  };
}

/** Данные модалки вебинара. */
export function mapWebinarModal(webinar) {
  if (!webinar) return null;

  return {
    id: webinar.id,
    title: webinar.title || "",
    date: formatWebinarDate(webinar.start_time),
    time: formatWebinarTime(webinar.start_time),
    talkPoints: mapTalkPoints(webinar),
    videoLinks: mapVideoLinks(webinar),
    expert: mapExpert(webinar.expert),
    isPast: Boolean(
      webinar.start_time &&
        new Date(webinar.end_time || webinar.start_time).getTime() <= Date.now(),
    ),
  };
}

/** Карточка для блока «Прошедшие вебинары» на главной. */
export function mapVideoToCard(webinar) {
  const duration =
    (typeof webinar.duration === "string" && webinar.duration.trim()) ||
    formatDuration(webinar.start_time, webinar.end_time);
  const modal = mapWebinarModal(webinar);

  return {
    id: webinar.id,
    image: resolveImage(webinar.preview || webinar.photo),
    duration,
    tag: formatTag(webinar),
    title: webinar.title || "",
    stream_url: webinar.stream_url || "",
    modal,
  };
}

/** Карточка для страницы «Все выпуски». */
export function mapVideoToArchiveCard(webinar) {
  const card = mapVideoToCard(webinar);
  return {
    id: card.id,
    title: card.title,
    img: card.image,
    stream_url: card.stream_url,
    modal: card.modal,
  };
}

/** Блок «Ближайший вебинар» на главной. */
export function mapNextWebinar(webinar) {
  if (!webinar) return null;

  const expert = mapExpert(webinar.expert);

  return {
    id: webinar.id,
    image: resolveImage(webinar.photo || webinar.preview, "/q.jpg"),
    time: formatWebinarTime(webinar.start_time),
    date: formatWebinarDate(webinar.start_time),
    tag: formatTag(webinar),
    title: formatTitle(webinar.title),
    description: webinar.description || "",
    stream_url: normalizeUrl(webinar.stream_url || ""),
    question_url: normalizeUrl(webinar.question_url || ""),
    expert: expert
      ? {
          ...expert,
          // только short_info — для блока ближайшего вебинара
          description: expert.shortInfo || "",
        }
      : null,
    modal: mapWebinarModal(webinar),
  };
}
