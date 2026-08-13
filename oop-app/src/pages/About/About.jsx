import styles from "./About.module.css";
import SprintSrtring from "../../components/SprintSrtring/SprintSrtring.jsx";
import Social from "../../components/Social/Social.jsx";
import { asset } from "../../utils/asset.js";
import { cnWow } from "../../utils/wow.js";
import { useSiteContent } from "../../hooks/useSiteContent.js";

const audienceCards = [
  {
    icon: "/briefcase.svg",
    title: "Для руководителей",
    text: "которые ищут новые инструменты управления.",
  },
  {
    icon: "/star.svg",
    title: "Для специалистов",
    text: "которые хотят следить за изменениями.",
  },
  {
    icon: "/teacher.svg",
    title: "Для студентов",
    text: "которые хотят слышать не только теорию, но и реальные кейсы.",
  },
];

export default function About() {
  const { content } = useSiteContent();
  const brand = content.brand;
  const about = content.about;
  const stats = content.stats;

  return (
    <>
      <div className={styles.about}>
        <div className={styles.cool__container_new}>
          <img
            className={styles.cool__vector_right}
            src={asset("/Vector.svg")}
            alt=""
            aria-hidden="true"
          />
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
                    {...cnWow(styles.text__red, "fadeInLeft", {
                      delay: "0.2s",
                    })}
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
                    <p className={styles.cool__text__info}>
                      {stats.topics_value}
                    </p>
                    <p className={styles.cool__text__infD}>
                      {stats.topics_label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SprintSrtring />

        <div className={styles.about__container}>
          <div className="container">
            <div className={styles.about__top}>
              <p {...cnWow(styles.about__title, "fadeInUp")}>
                История создания{" "}
              </p>
              <div className={styles.top_dop}>
                <div
                  {...cnWow(styles.about__top_left, "fadeInLeft", {
                    delay: "0.1s",
                  })}
                >
                  <div className={styles.about__imgLT}>
                    <img
                      className={styles.about__imgL2}
                      src={asset("/icon.svg")}
                      alt=""
                    />
                    <img
                      className={styles.about__imgL1}
                      src={asset("/micro2.png")}
                      alt=""
                    />
                  </div>
                  <div>
                    <p className={styles.about__textLT}>
                      В 2020 году, когда мир ушёл в самоизоляцию, мы заметили,
                      как многим из нас стало не хватать живого общения,
                      экспертного мнения и возможности перенимать опыт и учиться
                      у профессионалов. А множество онлайн курсов имели закрытый
                      или платный доступ.
                    </p>
                  </div>
                </div>
                <div
                  {...cnWow(styles.about__top_right, "fadeInRight", {
                    delay: "0.15s",
                  })}
                >
                  <div className={styles.about__top_RL}>
                    <div className={styles.about__textRTT}>
                      <p className={styles.about__textRT}>
                        {about.right_block_1}
                      </p>
                    </div>
                    <div className={styles.about__top_RR}>
                      <div className={styles.about__top_IMG}>
                        <div
                          className={`${styles.about__top_IMG_circle} ${styles.about__top_IMG_circle_1}`}
                        >
                          <img src={asset("/exp01.png")} alt="" />
                        </div>
                        <div
                          className={`${styles.about__top_IMG_circle} ${styles.about__top_IMG_circle_2}`}
                        >
                          <img src={asset("/exp1.png")} alt="" />
                        </div>
                        <div
                          className={`${styles.about__top_IMG_circle} ${styles.about__top_IMG_circle_3}`}
                        >
                          <img src={asset("/img3.png")} alt="" />
                        </div>
                        <div
                          className={`${styles.about__top_IMG_circle} ${styles.about__top_IMG_circle_4}`}
                        >
                          <img src={asset("/img2.png")} alt="" />
                        </div>
                        <div
                          className={`${styles.about__top_IMG_circle} ${styles.about__top_IMG_circle_5}`}
                        >
                          <img src={asset("/exp02.png")} alt="" />
                        </div>
                        <div
                          className={`${styles.about__top_IMG_circle} ${styles.about__top_IMG_circle_6}`}
                        >
                          <img src={asset("/exp03.png")} alt="" />
                        </div>
                      </div>

                      <div className={styles.about__top_TXT}>
                        <p className={styles.about__TXT}>
                          {about.right_block_2}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.pricip__container}>
                <div
                  {...cnWow(styles.about__bot, "fadeInUp", {
                    delay: "0.1s",
                  })}
                >
                  <div className={styles.about__bot_left}>
                    <p className={styles.about__bot_left_title}>ООП сейчас</p>
                    <p className={styles.about__bot_left_subtitle}>
                      На 2026 год наша коллекция насчитывает более 600 выпусков,
                      подкастов и интервью на различные темы карьеры и личной
                      жизни.
                    </p>
                    <p className={styles.about__bot_left_subtitle}>
                      Мы приглашаем профессионалов своего дела из HR, бизнеса,
                      государственного управления, IT, образования, психологии,
                      медицины и других сфер, чтобы они поделились своими
                      знаниями и опытом.
                    </p>
                  </div>
                  <div
                    {...cnWow(styles.about__bot_right, "fadeInRight", {
                      delay: "0.2s",
                    })}
                  >
                    <img
                      className={styles.about__bot_right_bg}
                      src={asset("/Vector.svg")}
                      alt=""
                      aria-hidden="true"
                    />
                    <p className={styles.about__prin_title}>
                      Наш главный принцип
                    </p>
                    <p className={styles.about__prin_text}>
                      Образование должно быть доступным.
                    </p>
                  </div>
                </div>
                <div {...cnWow(styles.vera, "fadeInUp", { delay: "0.15s" })}>
                  <p className={styles.vera__text}>
                    Мы верим, что знания — это базовая потребность человека.
                    Особенно в мире, который меняется быстрее, чем мы успеваем
                    привыкнуть к новому.
                  </p>
                  <p className={styles.vera__text1}>
                    Поэтому все наши выпуски мы делаем бесплатными, чтобы любой
                    желающий имел доступ к полезной информации.
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.bot}>
              <p {...cnWow(styles.bot__title, "fadeInUp")}>
                Для кого этот проект?
              </p>
              <p
                {...cnWow(styles.bot_subtitle, "fadeInUp", {
                  delay: "0.1s",
                })}
              >
                Для всех, кто хочет расти и саморазвиваться.
              </p>
              <div className={styles.bot__container}>
                {audienceCards.map((card, index) => (
                  <div
                    key={card.title}
                    {...cnWow(styles.bot__conteiner_info, "fadeInUp", {
                      delay: `${0.1 + index * 0.1}s`,
                    })}
                  >
                    <img
                      className={styles.bot__icon}
                      src={asset(card.icon)}
                      alt=""
                    />
                    <p className={styles.text_work}>{card.title}</p>
                    <p className={styles.text_work_tezt}>{card.text}</p>
                  </div>
                ))}

                <div
                  {...cnWow(styles.bot__conteiner_last, "zoomIn", {
                    delay: "0.4s",
                  })}
                >
                  <p className={styles.text_last}>
                    И просто для всех любознательных.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Social />
      </div>
    </>
  );
}
