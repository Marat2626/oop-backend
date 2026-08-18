import { useEffect, useMemo, useState } from "react";
import styles from "./Calendar.module.css";
import { asset } from "../../utils/asset.js";
import { cnWow } from "../../utils/wow.js";
import { fetchPastVideos, fetchPublicWebinars } from "../../api/webinars.js";
import { mapWebinarModal } from "../../utils/mapWebinar.js";
import WebinarModal from "../../components/WebinarModal/WebinarModal.jsx";

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDateKeyFromIso(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  // Ключ дня в МСК — как formatEventDate / formatEventTime
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Moscow" });
}

function formatEventDate(iso) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Moscow",
  });
}

function formatEventTime(iso) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Moscow",
  });
  return `${time} (МСК)`;
}

function formatTag(webinar) {
  if (Array.isArray(webinar.rubrics) && webinar.rubrics.length > 0) {
    const name = webinar.rubrics[0]?.name || webinar.rubrics[0];
    return name ? `#${name}` : "";
  }
  return "";
}

function mapWebinarToEvent(webinar) {
  const modal = mapWebinarModal(webinar);
  const expertName = webinar.expert?.name || "";

  return {
    id: webinar.id,
    tag: formatTag(webinar),
    name: webinar.title || "",
    date: formatEventDate(webinar.start_time),
    time: formatEventTime(webinar.start_time),
    speaker: expertName,
    place: "Онлайн",
    startTime: webinar.start_time,
    modal,
  };
}

async function fetchAllWebinars() {
  const byId = new Map();

  const past = await fetchPastVideos();
  past.forEach((item) => byId.set(item.id, item));

  let page = 1;
  while (page <= 20) {
    const items = await fetchPublicWebinars({ page, limit: 50 });
    items.forEach((item) => byId.set(item.id, item));
    if (items.length < 50) break;
    page += 1;
  }

  return Array.from(byId.values());
}

function buildEventsMap(webinars) {
  const events = {};

  webinars
    .slice()
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
    .forEach((webinar) => {
      const key = toDateKeyFromIso(webinar.start_time);
      if (!key) return;
      if (!events[key]) {
        events[key] = mapWebinarToEvent(webinar);
      }
    });

  return events;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarDays(year, month) {
  const days = [];
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startDay = firstOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i -= 1) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      muted: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      date: new Date(year, month, day),
      muted: false,
    });
  }

  let nextDay = 1;
  while (days.length % 7 !== 0) {
    days.push({
      date: new Date(year, month + 1, nextDay),
      muted: true,
    });
    nextDay += 1;
  }

  return days;
}

function formatMonthTitle(date) {
  const title = date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function findNearestEventDate(fromDate, events) {
  const keys = Object.keys(events).sort();
  if (keys.length === 0) return fromDate;

  const fromKey = toDateKey(fromDate);
  const nearestKey = keys.find((key) => key >= fromKey) ?? keys[keys.length - 1];
  const [y, m, d] = nearestKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function Calendar() {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWebinar, setSelectedWebinar] = useState(null);

  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const webinars = await fetchAllWebinars();
        if (cancelled) return;

        const nextEvents = buildEventsMap(webinars);
        setEvents(nextEvents);

        setSelectedDate((prev) => {
          if (nextEvents[toDateKey(prev)]) return prev;
          return findNearestEventDate(today, nextEvents);
        });
      } catch {
        if (!cancelled) setEvents({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [today]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);

  const selectedEvent = events[toDateKey(selectedDate)];
  const isSelectedPast = selectedEvent
    ? new Date(selectedEvent.startTime).getTime() < Date.now()
    : selectedDate.getTime() < today.getTime();
  const sideTitle = isSelectedPast
    ? "Прошедший вебинар"
    : "Ближайшие мероприятия";

  const goPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    if (day.muted) {
      setViewDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    }
  };

  const handleNearestClick = () => {
    const nearestDate = findNearestEventDate(today, events);
    setSelectedDate(nearestDate);
    setViewDate(new Date(nearestDate.getFullYear(), nearestDate.getMonth(), 1));
  };

  return (
    <div className={styles.calendar__container}>
      <div className="container">
        <div className={styles.calendar__head}>
          <p {...cnWow(styles.calendar__title, "fadeInUp")}>
            Календарь вебинаров
          </p>
          <p
            {...cnWow(styles.calendar__subtitle, "fadeInUp", {
              delay: "0.1s",
            })}
          >
            Выберите дату, чтобы увидеть запланированные мероприятия
          </p>
        </div>

        <div className={styles.calendar__content}>
          <section
            {...cnWow(styles.calendar__left, "fadeInLeft", {
              delay: "0.15s",
            })}
          >
            <div className={styles.calendar__header}>
              <button
                type="button"
                className={styles.arrow}
                aria-label="Предыдущий месяц"
                onClick={goPrevMonth}
              >
                &#8249;
              </button>
              <p className={styles.month}>{formatMonthTitle(viewDate)}</p>
              <button
                type="button"
                className={styles.arrow}
                aria-label="Следующий месяц"
                onClick={goNextMonth}
              >
                &#8250;
              </button>
            </div>

            <div className={styles.weekdays}>
              {WEEK_DAYS.map((day) => (
                <p key={day} className={styles.weekday}>
                  {day}
                </p>
              ))}
            </div>

            <div className={styles.grid}>
              {days.map((day) => {
                const dateKey = toDateKey(day.date);
                const isSelected = isSameDay(day.date, selectedDate);
                const isToday = isSameDay(day.date, today);
                const hasEvent = Boolean(events[dateKey]);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={[
                      styles.day,
                      day.muted ? styles.dayMuted : "",
                      isSelected ? styles.dayActive : "",
                      !isSelected && isToday ? styles.daySoft : "",
                      hasEvent ? styles.dayHasEvent : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleDayClick(day)}
                  >
                    <span>{day.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside
            {...cnWow(styles.event__side, "fadeInRight", {
              delay: "0.2s",
            })}
          >
            <h2 className={styles.event__title}>{sideTitle}</h2>

            {loading ? (
              <div className={styles.event__empty}>
                <p className={styles.event__emptyTitle}>Загрузка...</p>
              </div>
            ) : selectedEvent ? (
              <div className={styles.event__card}>
                {selectedEvent.tag && (
                  <span className={styles.event__tag}>{selectedEvent.tag}</span>
                )}
                <p className={styles.event__name}>{selectedEvent.name}</p>

                <div className={styles.event__meta}>
                  <p>
                    <img
                      src={asset("/Calendar.svg")}
                      alt=""
                      aria-hidden="true"
                    />
                    {selectedEvent.date}
                  </p>
                  <p>
                    <img src={asset("/Clock.svg")} alt="" aria-hidden="true" />
                    {selectedEvent.time}
                  </p>
                  {selectedEvent.speaker && (
                    <p>
                      <img
                        src={asset("/User11.svg")}
                        alt=""
                        aria-hidden="true"
                      />
                      {selectedEvent.speaker}
                    </p>
                  )}
                  <p>
                    <img
                      src={asset("/MapPin11.svg")}
                      alt=""
                      aria-hidden="true"
                    />
                    {selectedEvent.place}
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.event__button}
                  onClick={() => {
                    if (selectedEvent.modal) {
                      setSelectedWebinar(selectedEvent.modal);
                    }
                  }}
                >
                  Подробнее
                  <img src={asset("/arrow.svg")} alt="" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className={styles.event__empty}>
                <p className={styles.event__emptyTitle}>
                  Нет вебинаров в этот день
                </p>
                <p className={styles.event__emptyText}>
                  Посмотрите другие даты или выберите ближайшее мероприятие
                </p>
                <button
                  type="button"
                  className={styles.event__emptyButton}
                  onClick={handleNearestClick}
                >
                  Ближайшие вебинары
                  <img src={asset("/arrow.svg")} alt="" aria-hidden="true" />
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      <WebinarModal
        webinar={selectedWebinar}
        isPast={selectedWebinar?.isPast !== false}
        onClose={() => setSelectedWebinar(null)}
      />
    </div>
  );
}
