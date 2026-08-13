import { useMemo, useState } from "react";
import styles from "./Vebinars.module.css";
import { cnWow } from "../../utils/wow.js";
import { useArchiveWebinars } from "../../hooks/useArchiveWebinars.js";
import { useRubrics } from "../../hooks/useRubrics.js";
import WebinarModal from "../../components/WebinarModal/WebinarModal.jsx";

export default function Vabinars() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [rubricId, setRubricId] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);

  const { rubrics } = useRubrics();
  const { videos, loading } = useArchiveWebinars({ search, rubricId });

  const sectionTitle = useMemo(() => {
    if (!rubricId) return "Все выпуски";
    const rubric = rubrics.find((item) => item.id === String(rubricId));
    return rubric?.name || "Выпуски";
  }, [rubricId, rubrics]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className={styles.vebinars__container}>
      <div className="container">
        <div className={styles.vebinars}>
          <div className={styles.vebinars__header}>
            <p {...cnWow(styles.vebinars__header__title, "fadeInUp")}>
              Коллекция прошедших вебинаров
            </p>
            <p
              {...cnWow(styles.vebinars__header__text, "fadeInUp", {
                delay: "0.1s",
              })}
            >
              Все записи наших вебинаров, подкастов и интервью в одном месте
            </p>
          </div>

          <form
            {...cnWow(styles.inputWrapper, "fadeInUp", { delay: "0.15s" })}
            onSubmit={handleSearch}
          >
            <div className={styles.input}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15.5 15.5L19 19M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="#6f6f6f"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.button} aria-label="Поиск">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15.5 15.5L19 19M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <div
            {...cnWow(styles.button__wrapper, "fadeIn", { delay: "0.2s" })}
          >
            <button
              type="button"
              className={`${styles.button__card} ${
                rubricId == null ? styles.button__card_active : ""
              }`}
              onClick={() => setRubricId(null)}
            >
              Все
            </button>
            {rubrics.map((rubric) => (
              <button
                key={rubric.id}
                type="button"
                className={`${styles.button__card} ${
                  String(rubricId) === rubric.id
                    ? styles.button__card_active
                    : ""
                }`}
                onClick={() => setRubricId(rubric.id)}
              >
                {rubric.name}
              </button>
            ))}
          </div>

          <div className={styles.effect__container}>
            <p></p>
            <div className={styles.effect__card}>
              <div className={styles.effect__card}></div>
            </div>
          </div>
        </div>

        <div
          {...cnWow(styles.vebinars__footer, "fadeInLeft", {
            delay: "0.1s",
          })}
        >
          <p className={styles.vebinars__footer__text}>{sectionTitle}</p>
        </div>

        <div className={styles.cards__grid}>
          {loading ? (
            <p className={styles.empty__text}>Загрузка...</p>
          ) : videos.length === 0 ? (
            <p className={styles.empty__text}>Вебинары не найдены</p>
          ) : (
            videos.map((item, index) => (
              <div
                key={item.id}
                {...cnWow(styles.card, "fadeInUp", {
                  delay: `${0.05 + (index % 6) * 0.08}s`,
                })}
              >
                <div
                  className={styles.card__image}
                  style={{
                    backgroundImage: `url(${item.img})`,
                  }}
                >
                  <button
                    type="button"
                    className={styles.play__button}
                    aria-label="Подробнее"
                    onClick={() => setSelectedWebinar(item.modal)}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 3L19 12L5 21V3Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className={styles.card__overlay}>
                    <p className={styles.card__title}>{item.title}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <WebinarModal
        webinar={selectedWebinar}
        isPast
        onClose={() => setSelectedWebinar(null)}
      />
    </div>
  );
}
