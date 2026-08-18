import styles from "./Social.module.css";
import { cnWow } from "../../utils/wow.js";
import { useSocials } from "../../hooks/useSocials.js";
import { getSocialFallbackIcon } from "../../utils/socialFallback.js";

function handleIconError(event, name) {
  const fallback = getSocialFallbackIcon(name);
  if (fallback && event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
}

export default function Social() {
  const { socials } = useSocials();

  return (
    <div className={styles.social__container}>
      <div className="container">
        <div className={styles.social__container__dop}>
          <div className={styles.social__container__top}>
            <p {...cnWow(styles.social__title, "fadeInUp")}>
              Где смотреть наши вебинары
            </p>
            <p
              {...cnWow(styles.social__subTitle, "fadeInUp", {
                delay: "0.15s",
              })}
            >
              Подписывайтесь на наши платформы, чтобы не пропустить новые
              вебинары, интервью и подкасты
            </p>
          </div>
          <div className={styles.social__container__bot}>
            {socials.map((social, index) => {
              const wowProps = cnWow(styles.cocial__img__container, "zoomIn", {
                delay: `${0.1 + index * 0.08}s`,
              });

              if (social.url) {
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${wowProps.className} ${styles.social__link}`}
                    data-wow-delay={wowProps["data-wow-delay"]}
                  >
                    <img
                      className={styles.social__img}
                      src={social.icon}
                      alt={social.name}
                      onError={(event) => handleIconError(event, social.name)}
                    />
                  </a>
                );
              }

              return (
                <div key={social.id} {...wowProps}>
                  <img
                    className={styles.social__img}
                    src={social.icon}
                    alt={social.name}
                    onError={(event) => handleIconError(event, social.name)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
