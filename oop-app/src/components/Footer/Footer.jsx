import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { useSiteContent } from "../../hooks/useSiteContent.js";
import { QUESTION_URL } from "../../constants/externalLinks.js";

export default function Footer() {
  const { content, logoPrimary, logoSecondary, navLinks } = useSiteContent();

  const handleNavClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className={styles.footer}>
        <div className="container">
          <div className={styles.footer__container}>
            <div className={styles.footer__top_top}>
              <div className={styles.footer__top}>
                <Link
                  to="/"
                  className={styles.logo__container}
                  onClick={handleNavClick}
                  aria-label="На главную"
                >
                  <img className={styles.logo1} src={logoPrimary} alt="Logo" />
                  <img
                    className={styles.logo}
                    src={logoSecondary}
                    alt="Logo 1"
                  />
                </Link>
                <div className={styles.footer.top_bot}>
                  <p className={styles.footer__text}>
                    Университет Правительства Москвы Проект «Открытое
                    образовательное пространство»
                  </p>
                </div>
              </div>
              <nav className={styles.footer_nav}>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    className={styles.nav_color}
                    to={link.to}
                    onClick={handleNavClick}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className={styles.footer__link}>
                <div className={styles.footer__link_top}>
                  <p className={styles.footer__title}>
                    Есть вопрос или предложение?
                  </p>
                  <p className={styles.footer__text}>
                    Напишите нам — будем рады помочь
                  </p>
                </div>
                <div className={styles.footer__link_bot}>
                  <a
                    href={QUESTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footer__button}
                  >
                    {content.nav.question_cta}
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.footer__top_contact}>
              <div className={styles.footer__top1}>
                <p className={styles.footer_contact}>
                  © 2026 Открытое образовательное пространство
                </p>
              </div>
              <div className={styles.footer__top2}>
                <p className={styles.footer_contact}>info@mguu.ru</p>
                <p className={styles.footer_contact}> +7 (495) 957-75-75</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
