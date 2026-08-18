import styles from "./Main.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useMemo, useRef, useState } from "react";
import Social from "../../components/Social/Social.jsx";
import WebinarModal from "../../components/WebinarModal/WebinarModal.jsx";
import { asset } from "../../utils/asset.js";
import { Link } from "react-router-dom";
import { cnWow } from "../../utils/wow.js";
import { useExperts } from "../../hooks/useExperts.js";
import { usePastWebinars } from "../../hooks/usePastWebinars.js";
import { useNextWebinar } from "../../hooks/useNextWebinar.js";
import { QUESTION_URL } from "../../constants/externalLinks.js";
import { useSiteContent } from "../../hooks/useSiteContent.js";
import { toStreamEmbedUrl } from "../../utils/streamEmbed.js";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Main() {
  const { content } = useSiteContent();
  const brand = content.brand;
  const hero = content.home_hero;
  const wb = content.home_webinar;
  const stats = content.stats;

  const { experts } = useExperts();
  const pastLimit = wb.past_display === "featured_video" ? 24 : 4;
  const { videos: pastWebinars } = usePastWebinars({ limit: pastLimit });
  const { webinar: nextWebinar } = useNextWebinar();
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const nextRef = useRef(null);
  const prevRef = useRef(null);
  const paginationRef = useRef(null);

  const showNextBlock =
    Boolean(nextWebinar) &&
    (wb.mode === "force_next" || wb.mode === "auto");
  const showPastBlock =
    wb.mode === "force_past" ||
    wb.mode === "auto" ||
    (wb.mode === "force_next" && !nextWebinar);

  const nextStreamUrl = (wb.stream_url || "").trim();
  const nextEmbedUrl =
    wb.media_mode === "stream" ? toStreamEmbedUrl(nextStreamUrl) : null;
  const showNextStream =
    wb.media_mode === "stream" && Boolean(nextStreamUrl);

  const displayedPast = useMemo(() => {
    if (wb.past_display === "featured_video") {
      const featuredId = wb.featured_past_webinar_id;
      if (featuredId != null) {
        const found = pastWebinars.find(
          (v) => String(v.id) === String(featuredId),
        );
        if (found) return [found];
      }
      return pastWebinars.slice(0, 1);
    }
    return pastWebinars.slice(0, 4);
  }, [pastWebinars, wb.past_display, wb.featured_past_webinar_id]);

  const handleNavClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.main__container}>
        <div className="container">
          <div className={styles.content}>
            <div className={styles.left__top}>
              <p
                {...cnWow(styles.text__title, "fadeInLeft", { delay: "0.1s" })}
              >
                {brand.title_line1}
              </p>
              <p {...cnWow(styles.text__red, "fadeInLeft", { delay: "0.2s" })}>
                {brand.title_line2}
              </p>
              <p
                {...cnWow(styles.text__title, "fadeInLeft", { delay: "0.3s" })}
              >
                {brand.title_line3}
              </p>
              <p {...cnWow(styles.text, "fadeInLeft", { delay: "0.4s" })}>
                {hero.subtitle}
              </p>

              <div
                {...cnWow(styles.container__button, "fadeInUp", {
                  delay: "0.55s",
                })}
              >
                <Link
                  to="/webinars"
                  className={styles.button__osn}
                  onClick={handleNavClick}
                >
                  <p>{hero.primary_cta}</p>
                  <img src={asset("/arrow.svg")} alt="" />
                </Link>
                <Link
                  to="/calendar"
                  className={styles.button__dop}
                  onClick={handleNavClick}
                >
                  {hero.secondary_cta}
                </Link>
              </div>
            </div>

            <div
              {...cnWow(styles.images, "fadeInRight", {
                delay: "0.35s",
                duration: "1.2s",
              })}
            >
              <img
                className={styles.icon}
                src={asset("/icon.svg")}
                alt=""
                aria-hidden="true"
              />
              <img
                className={styles.micro__icon}
                src={asset("/mikro.svg")}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.speed__string}>
        <div className={styles.speed__track}>
          <span className={styles.text__speed}>
            ВЕБИНАРЫ / ПОДКАСТЫ / ИНТЕРВЬЮ / КОНФЕРЕНЦИИ / БЕСПЛАТНО / ОНЛАЙН
          </span>
          <span className={styles.gap} aria-hidden="true" />
          <span className={styles.text__speed} aria-hidden="true">
            ВЕБИНАРЫ / ПОДКАСТЫ / ИНТЕРВЬЮ / КОНФЕРЕНЦИИ / БЕСПЛАТНО / ОНЛАЙН
          </span>
          <span className={styles.gap} aria-hidden="true" />
        </div>
      </div>

      {showNextBlock ? (
      <div className={styles.webinar__container}>
        <div className="container">
          <div className={styles.webinar__top}>
            <p {...cnWow(styles.webinar__title, "fadeInUp")}>
              {wb.next_title}
            </p>
            <div
              {...cnWow(
                `${styles.webinar__right} ${styles.webinar__right_desktop}`,
                "fadeIn",
                { delay: "0.15s" },
              )}
            >
              <Link
                to="/calendar"
                className={styles.webinar__header__text}
                onClick={handleNavClick}
              >
                {wb.next_link_label}
              </Link>
              <img
                className={styles.webinar__header__img}
                src={asset("/arrowPink.svg")}
                alt=""
              />
            </div>
          </div>

          {nextWebinar && (
            <div
              {...cnWow(styles.webinar__bot, "fadeInUp", {
                delay: "0.1s",
                duration: "0.9s",
              })}
            >
              <div
                {...cnWow(styles.container__img, "fadeInLeft", {
                  delay: "0.2s",
                })}
              >
                {showNextStream && nextEmbedUrl ? (
                  <iframe
                    className={styles.container__stream}
                    src={nextEmbedUrl}
                    title={nextWebinar.title || "Онлайн-эфир"}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : showNextStream ? (
                  <a
                    href={nextStreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.container__stream_link}
                  >
                    <img src={nextWebinar.image} alt="Онлайн-эфир" />
                    <span className={styles.container__stream_badge}>
                      Смотреть эфир
                    </span>
                  </a>
                ) : (
                  <img src={nextWebinar.image} alt="Вебинар" />
                )}
              </div>

              <div
                {...cnWow(styles.info__container, "fadeInRight", {
                  delay: "0.25s",
                })}
              >
                <div className={styles.container__top}>
                  <div className={styles.info}>
                    {nextWebinar.date && (
                      <div className={styles.container__time}>
                        <img src={asset("/Calendar.svg")} alt="" />
                        <p className={styles.text__time}>{nextWebinar.date}</p>
                      </div>
                    )}
                    {nextWebinar.time && (
                      <div className={styles.container__time}>
                        <img
                          className={styles.container__time__img}
                          src={asset("/Clock.svg")}
                          alt=""
                        />
                        <p className={styles.text__time}>{nextWebinar.time}</p>
                      </div>
                    )}
                    {nextWebinar.tag && (
                      <div className={styles.container__time}>
                        <p className={styles.text__time}>{nextWebinar.tag}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.container__text}>
                    <p className={styles.container__text__category}>
                      {nextWebinar.title}
                    </p>
                  </div>
                </div>

                <div className={styles.button__conteiner}>
                  {nextWebinar.expert && (
                    <div className={styles.container__bot}>
                      {nextWebinar.expert.photo && (
                        <div className={styles.info__speacker}>
                          <div className={styles.speacker}>
                            <img
                              className={styles.container__img__speacer}
                              src={nextWebinar.expert.photo}
                              alt={nextWebinar.expert.name}
                            />
                          </div>
                        </div>
                      )}
                      <div className={styles.speacker__info}>
                        {nextWebinar.expert.name && (
                          <p className={styles.speacker__title}>
                            {nextWebinar.expert.name}
                          </p>
                        )}
                        {nextWebinar.expert.description && (
                          <p className={styles.speacker__text}>
                            {nextWebinar.expert.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className={styles.bu}>
                    <Link
                      to="/webinars"
                      className={styles.button__osn}
                      onClick={handleNavClick}
                    >
                      <p>{hero.primary_cta}</p>
                      <img src={asset("/arrow.svg")} alt="" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            {...cnWow(
              `${styles.section__link} ${styles.section__link_mobile}`,
              "fadeIn",
              { delay: "0.2s" },
            )}
          >
            <Link
              to="/calendar"
              className={styles.webinar__header__text}
              onClick={handleNavClick}
            >
              {wb.next_link_label}
            </Link>
            <img
              className={styles.webinar__header__img}
              src={asset("/arrowPink.svg")}
              alt=""
            />
          </div>
        </div>
      </div>
      ) : null}

      {showPastBlock ? (
      <div className={styles.webinras__video}>
        <div className="container">
          <div className={styles.webinar__top}>
            <p {...cnWow(styles.text_t, "fadeInUp")}>{wb.past_title}</p>
            <div
              {...cnWow(
                `${styles.webinar__right} ${styles.webinar__right_desktop}`,
                "fadeIn",
                { delay: "0.15s" },
              )}
            >
              <Link
                to="/webinars"
                className={styles.webinar__header__text}
                onClick={handleNavClick}
              >
                {wb.past_link_label}
              </Link>
              <img
                className={styles.webinar__header__img}
                src={asset("/arrowPink.svg")}
                alt=""
              />
            </div>
          </div>

          <div
            className={styles.video__grid}
            style={
              wb.past_display === "featured_video"
                ? { gridTemplateColumns: "1fr", maxWidth: 640 }
                : undefined
            }
          >
            {displayedPast.map((video, index) => (
              <button
                type="button"
                key={video.id}
                {...cnWow(styles.video__card, "fadeInUp", {
                  delay: `${0.1 + index * 0.1}s`,
                })}
                onClick={() => setSelectedWebinar(video.modal)}
              >
                <img
                  className={styles.video__image}
                  src={video.image}
                  alt="Видео"
                />
                <div className={styles.video__duration}>
                  <img src={asset("/polugon.svg")} alt="" />
                  <span>{video.duration}</span>
                </div>
                <div className={styles.video__info}>
                  <div className={styles.video__category}>
                    <span>{video.tag}</span>
                  </div>
                  <h3 className={styles.video__title}>{video.title}</h3>
                </div>
              </button>
            ))}
          </div>

          <div
            {...cnWow(
              `${styles.section__link} ${styles.section__link_mobile}`,
              "fadeIn",
              { delay: "0.2s" },
            )}
          >
            <Link
              to="/webinars"
              className={styles.webinar__header__text}
              onClick={handleNavClick}
            >
              {wb.past_link_label}
            </Link>
            <img
              className={styles.webinar__header__img}
              src={asset("/arrowPink.svg")}
              alt=""
            />
          </div>
        </div>
      </div>
      ) : null}

      <div className={styles.expert__container}>
        <div className="container">
          <div className={styles.expetr__top}>
            <p {...cnWow(styles.text_t, "fadeInUp")}>Наши эксперты</p>
            <a
              href={QUESTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              {...cnWow(
                `${styles.button__osn1} ${styles.expert__btn_desktop}`,
                "fadeInLeft",
                { delay: "0.15s" },
              )}
            >
              <p>Стать экспертом</p>
              <img src={asset("/arrow.svg")} alt="" />
            </a>
          </div>

          <div
            {...cnWow(styles.expert__wrapper, "fadeInUp", {
              delay: "0.1s",
              duration: "0.9s",
            })}
          >
            <div className={styles.expert__header}>
              <h2
                {...cnWow(styles.expert__tx_dop, "fadeIn", {
                  delay: "0.15s",
                })}
              >
                Спикеры и практики из разных сфер: управления, психологии,
                коммуникаций, бизнеса и цифровой среды.{" "}
              </h2>
              <a
                href={QUESTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                {...cnWow(
                  `${styles.button__osn1} ${styles.expert__btn_mobile}`,
                  "fadeInUp",
                  { delay: "0.2s" },
                )}
              >
                <p>Стать экспертом</p>
                <img src={asset("/arrow.svg")} alt="" />
              </a>
              <div {...cnWow(styles.expert__nav, "fadeIn", { delay: "0.25s" })}>
                <p ref={prevRef} className={styles.swiper__prev}>
                  <img src={asset("/Arrow2.svg")} alt="Prev" />
                </p>
                <p ref={nextRef} className={styles.swiper__next}>
                  <img src={asset("/Arrow1.svg")} alt="Next" />
                </p>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                0: { slidesPerView: "auto", spaceBetween: 14 },
                640: { slidesPerView: "auto", spaceBetween: 18 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
                1280: { slidesPerView: 4, spaceBetween: 30 },
              }}
              onInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.init();
                swiper.navigation.update();

                swiper.params.pagination.el = paginationRef.current;
                swiper.pagination.init();
                swiper.pagination.update();
              }}
            >
              {experts.map((expert) => (
                <SwiperSlide key={expert.id}>
                  <div className={styles.expert__card}>
                    <div className={styles.expert__photo}>
                      <img src={expert.photo} alt={expert.name} />
                      <div className={styles.expert__overlay}>
                        <p className={styles.expert__name}>{expert.name}</p>
                        {expert.organization && (
                          <p className={styles.expert__role}>
                            {expert.organization}
                          </p>
                        )}
                        {expert.role && (
                          <p className={styles.expert__description}>
                            {expert.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={styles.expert__footer}>
                      <div className={styles.expert__buttons}>
                        <button
                          type="button"
                          className={styles.btn__webinar}
                          disabled={!expert.modal}
                          onClick={() => {
                            if (expert.modal) setSelectedWebinar(expert.modal);
                          }}
                        >
                          {expert.buttonText}
                        </button>
                        <button
                          type="button"
                          className={styles.btn__arr}
                          aria-label="Открыть вебинар"
                          disabled={!expert.modal}
                          onClick={() => {
                            if (expert.modal) setSelectedWebinar(expert.modal);
                          }}
                        >
                          <img src={asset("/arrow.svg")} alt="" />
                        </button>
                      </div>
                      <p className={styles.expert__text}>{expert.footerText}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div
              ref={paginationRef}
              className={styles.swiper__pagination}
            ></div>
          </div>
        </div>
      </div>

      <div className={styles.cool__container}>
        <div className="container">
          <div className={styles.cool__content}>
            <div className={styles.cool__content__top}>
              <div className={styles.cool__left__top}>
                <p
                  {...cnWow(styles.text__title, "fadeInLeft", {
                    delay: "0.1s",
                  })}
                >
                  {brand.title_line1}
                </p>
                <p
                  {...cnWow(styles.text__red, "fadeInLeft", { delay: "0.2s" })}
                >
                  {brand.title_line2}
                </p>
                <p
                  {...cnWow(styles.text__title, "fadeInLeft", {
                    delay: "0.3s",
                  })}
                >
                  {brand.title_line3}
                </p>
              </div>
              <div
                {...cnWow(styles.cool__right__top, "fadeInRight", {
                  delay: "0.15s",
                })}
              >
                <p className={styles.cool__text}>
                  Проект, созданный в 2020 году. Команда проводит бесплатные
                  вебинары, подкасты, интервью и конференции с участием
                  экспертов из разных областей знаний.
                </p>
                <p className={styles.cool__text__dop}>
                  Цель проекта — сделать образование доступным и создать
                  пространство для развития и обмена опытом.
                </p>
                <Link
                  to="/about"
                  className={styles.webinar__right}
                  onClick={handleNavClick}
                >
                  <p className={styles.button__cool}>Подробнее</p>
                  <img src={asset("/arrowPink.svg")} alt="" />
                </Link>
              </div>
            </div>

            <div className={styles.cool__content__bot}>
              <div
                {...cnWow(styles.cool__bot__top, "fadeInUp", {
                  delay: "0.1s",
                })}
              >
                <div className={styles.cool__icon__container}>
                  <img
                    className={styles.cool__icon}
                    src={asset("/stat01.svg")}
                    alt=""
                  />
                </div>
                <div>
                  <p className={styles.cool__text__info}>
                    {stats.webinars_value}{" "}
                  </p>
                  <p className={styles.cool__text__infD}>
                    {stats.webinars_label}
                  </p>
                </div>
              </div>
              <div
                {...cnWow(styles.cool__bot__center, "fadeInUp", {
                  delay: "0.2s",
                })}
              >
                <div>
                  <img
                    className={styles.cool__icon}
                    src={asset("/stat2.svg")}
                    alt=""
                  />
                </div>
                <div>
                  <p className={styles.cool__text__info}>
                    {stats.listeners_value}{" "}
                  </p>
                  <p className={styles.cool__text__infD}>
                    {stats.listeners_label}
                  </p>
                </div>
                <div>
                  <img
                    className={styles.img__rel}
                    src={asset("/mac.svg")}
                    alt=""
                  />
                </div>
              </div>
              <div
                {...cnWow(styles.cool__bot__bot, "fadeInUp", {
                  delay: "0.3s",
                })}
              >
                <div>
                  <img
                    className={styles.cool__icon}
                    src={asset("/stat3.svg")}
                    alt=""
                  />
                </div>
                <div>
                  <p className={styles.cool__text__info}>{stats.topics_value}</p>
                  <p className={styles.cool__text__infD}>{stats.topics_label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Social />

      <WebinarModal
        webinar={selectedWebinar}
        isPast={selectedWebinar?.isPast !== false}
        onClose={() => setSelectedWebinar(null)}
      />
    </div>
  );
}
