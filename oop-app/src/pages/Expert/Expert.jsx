import { useEffect, useMemo, useState } from "react";
import styles from "./Expert.module.css";
import { asset } from "../../utils/asset.js";
import { cnWow } from "../../utils/wow.js";
import { useExperts } from "../../hooks/useExperts.js";
import WebinarModal from "../../components/WebinarModal/WebinarModal.jsx";
import { QUESTION_URL } from "../../constants/externalLinks.js";

const ROWS_PER_CHUNK = 2;

function getGridColumns() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth <= 670) return 1;
  if (window.innerWidth <= 1280) return 2;
  return 3;
}

export default function Expert() {
  const { experts } = useExperts();
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState(getGridColumns);
  const [visibleCount, setVisibleCount] = useState(
    () => getGridColumns() * ROWS_PER_CHUNK,
  );

  useEffect(() => {
    const onResize = () => setColumns(getGridColumns());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const chunkSize = columns * ROWS_PER_CHUNK;

  const filteredExperts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return experts;
    return experts.filter((expert) => {
      const haystack = [
        expert.name,
        expert.organization,
        expert.role,
        expert.footerText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [experts, search]);

  useEffect(() => {
    setVisibleCount(chunkSize);
  }, [search, chunkSize]);

  const visibleExperts = filteredExperts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExperts.length;

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + chunkSize);
  };

  const openExpertWebinar = (expert) => {
    if (expert.modal) setSelectedWebinar(expert.modal);
  };

  return (
    <div className={styles.expert__container}>
      <div className="container">
        <div className={styles.expert__top}>
          <div className={styles.expert__header}>
            <p {...cnWow(styles.expert__header__title, "fadeInUp")}>
              Наши эксперты
            </p>
            <p
              {...cnWow(styles.expert__header__text, "fadeInUp", {
                delay: "0.1s",
              })}
            >
              Спикеры и практики из разных сфер: управления, психологии,
              коммуникаций, бизнеса и цифровой среды.
            </p>
          </div>

          <a
            href={QUESTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            {...cnWow(styles.expert__cta, "fadeInLeft", {
              delay: "0.15s",
            })}
          >
            <span>Стать экспертом</span>
            <img src={asset("/arrow.svg")} alt="" aria-hidden="true" />
          </a>
        </div>

        <form
          {...cnWow(styles.inputWrapper, "fadeInUp", { delay: "0.2s" })}
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
          <button
            type="submit"
            className={styles.searchButton}
            aria-label="Поиск"
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
                d="M15.5 15.5L19 19M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <div className={styles.experts__grid}>
          {visibleExperts.map((expert, index) => (
            <article
              key={expert.id}
              {...cnWow(styles.expert__card, "fadeInUp", {
                delay: `${0.05 + (index % 6) * 0.08}s`,
              })}
            >
              <div className={styles.expert__photo}>
                <img src={expert.photo} alt={expert.name} />
                <div className={styles.expert__overlay}>
                  <p className={styles.expert__name}>{expert.name}</p>
                  {expert.organization && (
                    <p className={styles.expert__role}>{expert.organization}</p>
                  )}
                  {expert.role && (
                    <p className={styles.expert__description}>{expert.role}</p>
                  )}
                </div>
              </div>

              <div className={styles.expert__footer}>
                <div className={styles.expert__buttons}>
                  <button
                    type="button"
                    className={styles.btn__webinar}
                    disabled={!expert.modal}
                    onClick={() => openExpertWebinar(expert)}
                  >
                    {expert.buttonText}
                  </button>
                  <button
                    type="button"
                    className={styles.btn__arr}
                    aria-label="Открыть вебинар"
                    disabled={!expert.modal}
                    onClick={() => openExpertWebinar(expert)}
                  >
                    <img src={asset("/arrow.svg")} alt="" aria-hidden="true" />
                  </button>
                </div>
                <p className={styles.expert__text}>{expert.footerText}</p>
              </div>
            </article>
          ))}
        </div>

        {filteredExperts.length === 0 ? (
          <p className={styles.expert__empty}>
            {search
              ? `Ничего не найдено по запросу «${search}»`
              : "Эксперты пока не добавлены"}
          </p>
        ) : null}

        {hasMore ? (
          <button
            type="button"
            className={styles.expert__bottom}
            onClick={handleLoadMore}
          >
            <span className={styles.expert__bottom__text}>Все эксперты</span>
            <img src={asset("/arrowPink.svg")} alt="" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <WebinarModal
        webinar={selectedWebinar}
        isPast={selectedWebinar?.isPast !== false}
        onClose={() => setSelectedWebinar(null)}
      />
    </div>
  );
}
